const Application = require('./Application');

async function main() {
    const app = new Application();
    
    try {
        await app.init();
        app.setupGracefulShutdown();
        await app.start();
    } catch (error) {
        console.error('Ошибка запуска приложения:', error);
        process.exit(1);
    }
}

main();
