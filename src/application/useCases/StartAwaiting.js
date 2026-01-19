class StartAwaiting {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async forTime(userId, chatId) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            const User = require('../../domain/entities/User');
            user = new User({ id: userId, chatId });
        }

        user.startAwaitingTime();
        await this.userRepository.save(user);

        return { success: true };
    }

    async forUrl(userId, chatId) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            const User = require('../../domain/entities/User');
            user = new User({ id: userId, chatId });
        }

        user.startAwaitingUrl();
        await this.userRepository.save(user);

        return { success: true };
    }
}

module.exports = StartAwaiting;
