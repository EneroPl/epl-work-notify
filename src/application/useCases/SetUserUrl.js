class SetUserUrl {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, chatId, url) {
        let user = await this.userRepository.findById(userId);
        
        if (!user) {
            const User = require('../../domain/entities/User');
            user = new User({ id: userId, chatId });
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return { success: false, error: 'invalid_format' };
        }

        user.setUrl(url);
        user.chatId = chatId;
        
        await this.userRepository.save(user);

        return { success: true, url };
    }
}

module.exports = SetUserUrl;
