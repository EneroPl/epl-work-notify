class SetReminderTime {
    constructor(userRepository, schedulerService) {
        this.userRepository = userRepository;
        this.schedulerService = schedulerService;
    }

    async execute(userId, chatId, time) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            const User = require('../../domain/entities/User');
            user = new User({ id: userId, chatId });
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        const match = time.match(timeRegex);
        
        if (!match) {
            return { success: false, error: 'invalid_format' };
        }

        const hours = match[1].padStart(2, '0');
        const minutes = match[2].padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;

        user.setTime(formattedTime);
        user.chatId = chatId;
        
        await this.userRepository.save(user);

        if (user.isEnabled()) {
            this.schedulerService.scheduleReminder(user);
        }

        return { success: true, time: formattedTime, enabled: user.enabled };
    }
}

module.exports = SetReminderTime;
