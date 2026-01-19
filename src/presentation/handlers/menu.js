const { Markup } = require('telegraf');

function getMainMenu(status) {
    const timeText = status.time || 'не установлено';

    return Markup.inlineKeyboard([
        [Markup.button.callback(`⏰ Время: ${timeText}`, 'set_time')],
        [Markup.button.callback('🔗 Ссылка', 'set_url')],
        [Markup.button.callback(status.enabled ? '🔕 Выключить уведомления' : '🔔 Включить уведомления', 'toggle')],
        [Markup.button.callback('📊 Мои настройки', 'status')]
    ]);
}

module.exports = { getMainMenu };
