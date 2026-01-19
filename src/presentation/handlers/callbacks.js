const { getMainMenu } = require('./menu');

function registerCallbackHandlers(bot, useCases, config) {
    const { getUserStatus, startAwaiting, toggleNotifications, sendReminder } = useCases;

    bot.action('set_time', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        await startAwaiting.forTime(userId, chatId);
        ctx.answerCbQuery();

        ctx.reply(
            `⏰ Введи время для напоминания в формате <b>ЧЧ:ММ</b>

Например: <code>09:00</code> или <code>18:30</code>

Время указывается по Москве (Europe/Moscow)`,
            { parse_mode: 'HTML' }
        );
    });

    bot.action('set_url', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        const status = await getUserStatus.execute(userId, chatId);
        await startAwaiting.forUrl(userId, chatId);
        ctx.answerCbQuery();

        ctx.reply(
            `🔗 <b>Изменить ссылку</b>

Текущая ссылка:
<code>${status.url}</code>

Отправь новую ссылку (должна начинаться с http:// или https://)`,
            { parse_mode: 'HTML' }
        );
    });

    bot.action('toggle', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        const statusBefore = await getUserStatus.execute(userId, chatId);

        if (!statusBefore.time) {
            ctx.answerCbQuery('⚠️ Сначала установи время!');
            return;
        }

        await toggleNotifications.toggle(userId, chatId);
        const status = await getUserStatus.execute(userId, chatId);

        if (status.enabled) {
            ctx.answerCbQuery('🔔 Уведомления включены!');
        } else {
            ctx.answerCbQuery('🔕 Уведомления выключены');
        }

        ctx.editMessageReplyMarkup(getMainMenu(status).reply_markup);
    });

    bot.action('status', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        const status = await getUserStatus.execute(userId, chatId);
        const enabledText = status.enabled ? '🟢 Включены' : '🔴 Выключены';
        const timeText = status.time || 'не установлено';
        const repeatStatus = status.hasRepeatActive ? '🔴 Ожидают подтверждения' : '🟢 Нет активных';

        ctx.answerCbQuery();

        ctx.reply(
            `📊 <b>Твои настройки:</b>

⏰ Время: <b>${timeText}</b>
🔔 Уведомления: <b>${enabledText}</b>
🔁 Повторные: <b>${repeatStatus}</b>
🔗 Ссылка: <code>${status.url}</code>

${status.enabled ? '✅ Напоминания будут приходить по будням (Пн-Пт)' : '❌ Напоминания отключены'}`,
            { parse_mode: 'HTML' }
        );
    });

    bot.action(/confirm_sdd_(.+)/, async (ctx) => {
        const targetUserId = ctx.match[1];
        const clickerUserId = ctx.from.id.toString();

        if (targetUserId !== clickerUserId) {
            ctx.answerCbQuery('❌ Это не твоё уведомление!');
            return;
        }

        await sendReminder.confirmReminder(targetUserId);

        ctx.answerCbQuery('🎉 Молодец! СДД указан!');
        ctx.editMessageText(
            `✅ <b>СДД указан!</b>

Отличная работа! Повторные уведомления остановлены.
До завтра 👋`,
            { parse_mode: 'HTML' }
        );
    });
}

module.exports = { registerCallbackHandlers };
