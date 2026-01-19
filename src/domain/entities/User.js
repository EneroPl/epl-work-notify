class User {
    constructor({ id, chatId, time = null, url = null, enabled = false }) {
        this.id = id;
        this.chatId = chatId;
        this.time = time;
        this.url = url;
        this.enabled = enabled;
        this.awaitingTime = false;
        this.awaitingUrl = false;
    }

    setTime(time) {
        this.time = time;
        this.awaitingTime = false;
    }

    setUrl(url) {
        this.url = url;
        this.awaitingUrl = false;
    }

    enable() {
        if (!this.time) {
            throw new Error('Время не установлено');
        }
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    startAwaitingTime() {
        this.awaitingTime = true;
        this.awaitingUrl = false;
    }

    startAwaitingUrl() {
        this.awaitingUrl = true;
        this.awaitingTime = false;
    }

    isAwaitingTime() {
        return this.awaitingTime;
    }

    isAwaitingUrl() {
        return this.awaitingUrl;
    }

    isEnabled() {
        return this.enabled && this.time !== null;
    }

    getUrl(defaultUrl) {
        return this.url || defaultUrl;
    }

    getCronExpression() {
        if (!this.time) return null;
        const [hours, minutes] = this.time.split(':');
        return `${parseInt(minutes)} ${parseInt(hours)} * * 1-5`;
    }

    toJSON() {
        return {
            id: this.id,
            chatId: this.chatId,
            time: this.time,
            url: this.url,
            enabled: this.enabled,
            awaitingTime: this.awaitingTime,
            awaitingUrl: this.awaitingUrl
        };
    }

    static fromJSON(id, data) {
        return new User({
            id,
            chatId: data.chatId,
            time: data.time,
            url: data.url,
            enabled: data.enabled
        });
    }
}

module.exports = User;
