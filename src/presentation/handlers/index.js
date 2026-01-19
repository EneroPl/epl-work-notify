const { registerCommandHandlers } = require('./commands');
const { registerCallbackHandlers } = require('./callbacks');
const { registerTextHandlers } = require('./text');

function registerAllHandlers(bot, useCases, config) {
    registerCommandHandlers(bot, useCases, config);
    registerCallbackHandlers(bot, useCases, config);
    registerTextHandlers(bot, useCases, config);

    bot.catch((err, ctx) => {
        console.error('Ошибка бота:', err);
    });
}

module.exports = { registerAllHandlers };
