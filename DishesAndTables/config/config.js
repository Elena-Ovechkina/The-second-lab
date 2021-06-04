const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'dishesandtables'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/dishesandtables-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'dishesandtables'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/dishesandtables-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'dishesandtables'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/dishesandtables-production'
  }
};

module.exports = config[env];
