module.exports = {
  apps: [
    {
      name: 'adonis-kanban',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
    },
  ],
}
