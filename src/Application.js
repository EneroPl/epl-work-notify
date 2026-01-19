const { Telegraf } = require('telegraf');
const path = require('path');

const config = require('./config');

const FileUserRepository = require('./infrastructure/repositories/FileUserRepository');
const SchedulerService = require('./infrastructure/services/SchedulerService');
const NotificationService = require('./infrastructure/services/NotificationService');

const SetReminderTime = require('./application/useCases/SetReminderTime');
const SetUserUrl = require('./application/useCases/SetUserUrl');
const ToggleNotifications = require('./application/useCases/ToggleNotifications');
const SendReminder = require('./application/useCases/SendReminder');
const GetUserStatus = require('./application/useCases/GetUserStatus');
const StartAwaiting = require('./application/useCases/StartAwaiting');

const { registerAllHandlers } = require('./presentation/handlers');

class Application {
    constructor() {
        this.bot = null;
        this.userRepository = null;
        this.schedulerService = null;
        this.notificationService = null;
        this.useCases = null;
    }

    async init() {
        this.bot = new Telegraf(config.BOT_TOKEN);

        const dataFilePath = path.join(__dirname, '..', config.DATA_FILE);
        this.userRepository = new FileUserRepository(dataFilePath);

        this.schedulerService = new SchedulerService(config);
        this.notificationService = new NotificationService(this.bot);

        this.useCases = {
            setReminderTime: new SetReminderTime(this.userRepository, this.schedulerService),
            setUserUrl: new SetUserUrl(this.userRepository),
            toggleNotifications: new ToggleNotifications(this.userRepository, this.schedulerService),
            sendReminder: new SendReminder(
                this.userRepository, 
                this.notificationService, 
                this.schedulerService, 
                config
            ),
            getUserStatus: new GetUserStatus(this.userRepository, this.schedulerService, config),
            startAwaiting: new StartAwaiting(this.userRepository)
        };

        this.schedulerService.setReminderCallback(async (userId, chatId) => {
            await this.useCases.sendReminder.executeWithRepeat(userId);
        });

        this.schedulerService.setRepeatReminderCallback(async (userId, chatId) => {
            await this.useCases.sendReminder.execute(userId, true);
        });

        registerAllHandlers(this.bot, this.useCases, config);

        return this;
    }

    async initScheduledJobs() {
        const users = await this.userRepository.findAllEnabled();
        
        for (const user of users) {
            this.schedulerService.scheduleReminder(user);
        }

        console.log(`Загружено ${this.schedulerService.getActiveJobsCount()} активных напоминаний`);
    }

    async start() {
        await this.bot.launch();
        console.log('🤖 Бот запущен!');
        console.log('📋 Планфикс по умолчанию:', config.DEFAULT_URL);
        
        await this.initScheduledJobs();
    }

    async stop(signal) {
        console.log(`Получен ${signal}, останавливаем бота...`);
        this.schedulerService.stopAll();
        this.bot.stop(signal);
    }

    setupGracefulShutdown() {
        process.once('SIGINT', () => this.stop('SIGINT'));
        process.once('SIGTERM', () => this.stop('SIGTERM'));
    }
}

module.exports = Application;
