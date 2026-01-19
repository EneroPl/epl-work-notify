class GetUserStatus {
    constructor(userRepository, schedulerService, config) {
        this.userRepository = userRepository;
        this.schedulerService = schedulerService;
        this.config = config;
    }

    async execute(userId, chatId) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            const User = require('../../domain/entities/User');
            user = new User({ id: userId, chatId });
            await this.userRepository.save(user);
        }

        return {
            time: user.time,
            enabled: user.enabled,
            url: user.getUrl(this.config.DEFAULT_URL),
            hasRepeatActive: this.schedulerService.hasRepeatActive(userId),
            awaitingTime: user.awaitingTime,
            awaitingUrl: user.awaitingUrl
        };
    }
}

module.exports = GetUserStatus;
