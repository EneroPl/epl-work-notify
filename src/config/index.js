require('dotenv').config();

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    DEFAULT_URL: process.env.DEFAULT_URL || 'https://yourgoods.planfix.ru/planner/135538',
    REPEAT_INTERVAL_MS: parseInt(process.env.REPEAT_INTERVAL_MS) || 300000,
    TIMEZONE: process.env.TIMEZONE || 'Europe/Moscow',
    DATA_FILE: process.env.DATA_FILE || 'users_data.json'
};
