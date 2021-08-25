const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'auth'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/auth-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'auth'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/auth-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'auth'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/auth-production'
  }
};

module.exports = config[env];
