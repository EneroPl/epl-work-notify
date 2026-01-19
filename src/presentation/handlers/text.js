const { getMainMenu } = require('./menu');

function registerTextHandlers(bot, useCases, config) {
    const { getUserStatus, setReminderTime, setUserUrl } = useCases;

    bot.on('text', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;
        const text = ctx.message.text.trim();

        const status = await getUserStatus.execute(userId, chatId);

        if (status.awaitingUrl) {
            const result = await setUserUrl.execute(userId, chatId, text);

            if (!result.success) {
                ctx.reply(
                    `❌ Неверный формат ссылки!

Ссылка должна начинаться с <code>http://</code> или <code>https://</code>`,
                    { parse_mode: 'HTML' }
                );
                return;
            }

            const updatedStatus = await getUserStatus.execute(userId, chatId);

            ctx.reply(
                `✅ Ссылка установлена!

🔗 <code>${result.url}</code>`,
                { parse_mode: 'HTML', ...getMainMenu(updatedStatus) }
            );
            return;
        }

        if (status.awaitingTime) {
            const result = await setReminderTime.execute(userId, chatId, text);

            if (!result.success) {
                ctx.reply(
                    `❌ Неверный формат времени!

Введи время в формате <b>ЧЧ:ММ</b>
Например: <code>09:00</code> или <code>18:30</code>`,
                    { parse_mode: 'HTML' }
                );
                return;
            }

            const updatedStatus = await getUserStatus.execute(userId, chatId);

            ctx.reply(
                `✅ Время установлено: <b>${result.time}</b>

${result.enabled ? '🔔 Уведомления включены' : '⚠️ Не забудь включить уведомления!'}`,
                { parse_mode: 'HTML', ...getMainMenu(updatedStatus) }
            );
            return;
        }
    });
}

module.exports = { registerTextHandlers };
