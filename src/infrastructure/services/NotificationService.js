const { Markup } = require('telegraf');

class NotificationService {
    constructor(bot) {
        this.bot = bot;
    }

    async sendReminder(chatId, userId, url, isRepeat = false) {
        const repeatText = isRepeat 
            ? '\n\n⚠️ <b>Повторное напоминание!</b> Нажми "Указал" чтобы остановить.' 
            : '';

        const message = `🚨 <b>НАПОМИНАНИЕ!</b>

Зайди на планфикс и закрой нахуй ебаное СДД! 

🔗 <a href="${url}">Открыть Планфикс</a>

<i>Не забудь закрыть все задачи за сегодня!</i>${repeatText}`;

        try {
            await this.bot.telegram.sendMessage(chatId, message, {
                parse_mode: 'HTML',
                disable_web_page_preview: false,
                ...Markup.inlineKeyboard([
                    [Markup.button.url('📋 Открыть Планфикс', url)],
                    [Markup.button.callback('✅ Указал', `confirm_sdd_${userId}`)]
                ])
            });
        } catch (error) {
            console.error(`Ошибка отправки напоминания для ${chatId}:`, error);
        }
    }
}

module.exports = NotificationService;
