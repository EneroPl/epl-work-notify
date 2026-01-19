module.exports = {
    apps: [
      {
        name: 'tiktok',
        script: 'bot.js',
        namespace: 'telegram-bots',
        
        // Количество инстансов
        instances: 1,
        exec_mode: 'fork',
        
        // Перезагрузка
        autorestart: true,
        watch: false,
        max_restarts: 10,
        restart_delay: 4000,
        exp_backoff_restart_delay: 100,
        
        // Логирование
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        error_file: 'logs/error.log',
        out_file: 'logs/out.log',
        log_file: 'logs/combined.log',
        merge_logs: true,
        time: true,
        
        // Мониторинг
        max_memory_restart: '500M',
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 5000,
        
        // Переменные окружения
        env: {
          NODE_ENV: 'development',
          NODE_OPTIONS: '--max-old-space-size=512'
        },
        env_production: {
          NODE_ENV: 'production',
          NODE_OPTIONS: '--max-old-space-size=1024'
        },
        
        // Мониторинг здоровья
        min_uptime: '30s',
        
        // Уведомления (опционально)
        // source_map_support: true
      }
    ]
  };