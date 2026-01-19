const cron = require('node-cron');

class SchedulerService {
    constructor(config) {
        this.config = config;
        this.cronJobs = new Map();
        this.repeatIntervals = new Map();
        this.onReminderCallback = null;
        this.onRepeatReminderCallback = null;
    }

    setReminderCallback(callback) {
        this.onReminderCallback = callback;
    }

    setRepeatReminderCallback(callback) {
        this.onRepeatReminderCallback = callback;
    }

    scheduleReminder(user) {
        this.cancelReminder(user.id);

        if (!user.isEnabled()) {
            return;
        }

        const cronExpression = user.getCronExpression();
        if (!cronExpression) {
            return;
        }

        console.log(`Настройка cron для пользователя ${user.id}: ${cronExpression}`);

        const job = cron.schedule(cronExpression, () => {
            console.log(`Отправка напоминания пользователю ${user.id}`);
            if (this.onReminderCallback) {
                this.onReminderCallback(user.id, user.chatId);
            }
        }, {
            timezone: this.config.TIMEZONE
        });

        this.cronJobs.set(user.id, job);
    }

    cancelReminder(userId) {
        if (this.cronJobs.has(userId)) {
            this.cronJobs.get(userId).stop();
            this.cronJobs.delete(userId);
        }
    }

    startRepeatReminder(userId, chatId) {
        this.stopRepeatReminder(userId);

        console.log(`Запуск повторных уведомлений для ${userId}`);

        const interval = setInterval(() => {
            console.log(`Повторное уведомление для ${userId}`);
            if (this.onRepeatReminderCallback) {
                this.onRepeatReminderCallback(userId, chatId);
            }
        }, this.config.REPEAT_INTERVAL_MS);

        this.repeatIntervals.set(userId, interval);
    }

    stopRepeatReminder(userId) {
        if (this.repeatIntervals.has(userId)) {
            clearInterval(this.repeatIntervals.get(userId));
            this.repeatIntervals.delete(userId);
            console.log(`Повторные уведомления остановлены для ${userId}`);
            return true;
        }
        return false;
    }

    hasRepeatActive(userId) {
        return this.repeatIntervals.has(userId);
    }

    getActiveJobsCount() {
        return this.cronJobs.size;
    }

    stopAll() {
        for (const [userId, job] of this.cronJobs) {
            job.stop();
        }
        this.cronJobs.clear();

        for (const [userId, interval] of this.repeatIntervals) {
            clearInterval(interval);
        }
        this.repeatIntervals.clear();
    }
}

module.exports = SchedulerService;
