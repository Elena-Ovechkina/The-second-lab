const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'orderandpayment'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/orderandpayment-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'orderandpayment'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/orderandpayment-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'orderandpayment'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/orderandpayment-production'
  }
};

module.exports = config[env];
