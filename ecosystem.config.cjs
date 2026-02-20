module.exports = {
    apps: [
        {
            name: 'studiomystri-api',
            cwd: '/var/www/studiomystri/backend',
            script: 'dist/app.js',
            instances: 1, // TODO Phase 9 — add @socket.io/pm2 adapter for multi-instance
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '400M',
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
            error_file: '/var/log/studiomystri/error.log',
            out_file: '/var/log/studiomystri/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true,
        },
    ],
}
