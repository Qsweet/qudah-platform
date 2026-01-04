module.exports = {
    apps: [
        {
            name: 'mohammad-al-qudah-platform',
            script: '.next/standalone/server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                // Environment variables will be injected here or loaded from .env
            },
        },
    ],
};
