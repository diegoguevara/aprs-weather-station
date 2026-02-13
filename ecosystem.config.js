module.exports = {
  apps: [
    {
      name: 'aprs-weather-station',
      script: 'dist/index.js',
      node_args: '-r dotenv/config',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
