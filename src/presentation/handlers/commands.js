const { getMainMenu } = require('./menu');

function registerCommandHandlers(bot, useCases, config) {
    const { getUserStatus, startAwaiting, toggleNotifications, sendReminder } = useCases;

    bot.start(async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;
        
        const status = await getUserStatus.execute(userId, chatId);

        ctx.reply(
            `👋 Привет! Я бот для напоминаний о СДД в Планфиксе.

Я буду напоминать тебе по будням зайти и закрыть СДД.
Уведомления будут приходить каждые 5 минут пока ты не нажмёшь "Указал"!

📌 Ссылка: ${status.url}

Настрой время напоминания:`,
            getMainMenu(status)
        );
    });

    bot.help((ctx) => {
        ctx.reply(
            `📚 <b>Команды бота:</b>

/start - Главное меню
/time - Установить время напоминания
/url - Изменить ссылку
/on - Включить уведомления
/off - Выключить уведомления
/status - Показать текущие настройки
/stop - Остановить повторные уведомления

<b>Как это работает:</b>
1. Установи время напоминания
2. Установи ссылку (или используй стандартную)
3. Включи уведомления
4. Каждый будний день в указанное время получишь напоминание
5. Уведомления будут повторяться каждые 5 минут пока не нажмёшь "Указал"`,
            { parse_mode: 'HTML' }
        );
    });

    bot.command('time', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        await startAwaiting.forTime(userId, chatId);

        ctx.reply(
            `⏰ Введи время для напоминания в формате <b>ЧЧ:ММ</b>

Например: <code>09:00</code> или <code>18:30</code>

Время указывается по Москве (Europe/Moscow)`,
            { parse_mode: 'HTML' }
        );
    });

    bot.command('url', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        const status = await getUserStatus.execute(userId, chatId);
        await startAwaiting.forUrl(userId, chatId);

        ctx.reply(
            `🔗 <b>Изменить ссылку</b>

Текущая ссылка:
<code>${status.url}</code>

Отправь новую ссылку (должна начинаться с http:// или https://)`,
            { parse_mode: 'HTML' }
        );
    });

    bot.command('on', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        const result = await toggleNotifications.enable(userId, chatId);

        if (!result.success) {
            if (result.error === 'time_not_set') {
                ctx.reply('⚠️ Сначала установи время командой /time');
            }
            return;
        }

        ctx.reply(`✅ Уведомления включены! Буду напоминать каждый будний день в ${result.time}\n\n⚠️ Уведомления будут повторяться каждые 5 минут пока не нажмёшь "Указал"`);
    });

    bot.command('off', async (ctx) => {
        const userId = ctx.from.id.toString();

        await toggleNotifications.disable(userId);

        ctx.reply('🔕 Уведомления выключены');
    });

    bot.command('stop', async (ctx) => {
        const userId = ctx.from.id.toString();

        const result = await sendReminder.stopRepeat(userId);

        if (result.wasActive) {
            ctx.reply('✅ Повторные уведомления остановлены до следующего напоминания');
        } else {
            ctx.reply('ℹ️ Повторные уведомления не были активны');
        }
    });

    bot.command('status', async (ctx) => {
        const userId = ctx.from.id.toString();
        const chatId = ctx.chat.id;

        const status = await getUserStatus.execute(userId, chatId);
        const enabledText = status.enabled ? '🟢 Включены' : '🔴 Выключены';
        const timeText = status.time || 'не установлено';
        const repeatStatus = status.hasRepeatActive ? '🔴 Ожидают подтверждения' : '🟢 Нет активных';

        ctx.reply(
            `📊 <b>Твои настройки:</b>

⏰ Время: <b>${timeText}</b>
🔔 Уведомления: <b>${enabledText}</b>
🔁 Повторные: <b>${repeatStatus}</b>
🔗 Ссылка: <code>${status.url}</code>

${status.enabled ? '✅ Напоминания будут приходить по будням (Пн-Пт)' : '❌ Напоминания отключены'}`,
            { parse_mode: 'HTML', ...getMainMenu(status) }
        );
    });

    bot.command('test', async (ctx) => {
        const userId = ctx.from.id.toString();

        ctx.reply('📤 Отправляю тестовое напоминание...');
        await sendReminder.executeWithRepeat(userId);
    });
}

module.exports = { registerCommandHandlers };
