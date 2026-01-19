class ToggleNotifications {
    constructor(userRepository, schedulerService) {
        this.userRepository = userRepository;
        this.schedulerService = schedulerService;
    }

    async enable(userId, chatId) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            return { success: false, error: 'user_not_found' };
        }

        if (!user.time) {
            return { success: false, error: 'time_not_set' };
        }

        user.enable();
        user.chatId = chatId;
        
        await this.userRepository.save(user);
        this.schedulerService.scheduleReminder(user);

        return { success: true, time: user.time };
    }

    async disable(userId) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            return { success: false, error: 'user_not_found' };
        }

        user.disable();
        
        await this.userRepository.save(user);
        this.schedulerService.cancelReminder(userId);
        this.schedulerService.stopRepeatReminder(userId);

        return { success: true };
    }

    async toggle(userId, chatId) {
        let user = await this.userRepository.findById(userId);
        
        if (!user || !user.time) {
            return { success: false, error: 'time_not_set' };
        }

        if (user.enabled) {
            return await this.disable(userId);
        } else {
            return await this.enable(userId, chatId);
        }
    }
}

module.exports = ToggleNotifications;
