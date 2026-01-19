const fs = require('fs');
const User = require('../../domain/entities/User');
const UserRepository = require('../../domain/repositories/UserRepository');

class FileUserRepository extends UserRepository {
    constructor(dataFilePath) {
        super();
        this.filePath = dataFilePath;
        this.cache = null;
    }

    _loadData() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
        return {};
    }

    _saveData(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
            this.cache = data;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    async findById(userId) {
        const data = this._loadData();
        const userData = data[userId];
        
        if (!userData) {
            return null;
        }

        const user = new User({
            id: userId,
            chatId: userData.chatId,
            time: userData.time,
            url: userData.url,
            enabled: userData.enabled
        });

        user.awaitingTime = userData.awaitingTime || false;
        user.awaitingUrl = userData.awaitingUrl || false;

        return user;
    }

    async save(user) {
        const data = this._loadData();
        data[user.id] = user.toJSON();
        this._saveData(data);
    }

    async findAllEnabled() {
        const data = this._loadData();
        const users = [];

        for (const [userId, userData] of Object.entries(data)) {
            if (userData.enabled && userData.time && userData.chatId) {
                const user = new User({
                    id: userId,
                    chatId: userData.chatId,
                    time: userData.time,
                    url: userData.url,
                    enabled: userData.enabled
                });
                users.push(user);
            }
        }

        return users;
    }
}

module.exports = FileUserRepository;
