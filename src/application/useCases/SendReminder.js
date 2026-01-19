class SendReminder {
    constructor(userRepository, notificationService, schedulerService, config) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.schedulerService = schedulerService;
        this.config = config;
    }

    async execute(userId, isRepeat = false) {
        const user = await this.userRepository.findById(userId);
        
        if (!user) {
            console.error(`Пользователь ${userId} не найден`);
            return { success: false };
        }

        const url = user.getUrl(this.config.DEFAULT_URL);
        
        await this.notificationService.sendReminder(user.chatId, userId, url, isRepeat);

        return { success: true };
    }

    async executeWithRepeat(userId) {
        await this.execute(userId, false);
        
        const user = await this.userRepository.findById(userId);
        if (user) {
            this.schedulerService.startRepeatReminder(user.id, user.chatId);
        }
    }

    async confirmReminder(userId) {
        this.schedulerService.stopRepeatReminder(userId);
        return { success: true };
    }

    async stopRepeat(userId) {
        const stopped = this.schedulerService.stopRepeatReminder(userId);
        return { success: true, wasActive: stopped };
    }
}

module.exports = SendReminder;
