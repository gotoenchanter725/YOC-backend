require('dotenv').config();

module.exports = {
  "development": {
    "username": "root",
    "password": null,
    "database": "yocdb",
    "host": "127.0.0.1",
    "dialect": "mysql", 
    'freezeTableName': true
  },
  "test": {
    "username": "root",
    "password": "friend.b617",
    "database": "yocdb",
    "host": "127.0.0.1",
    "dialect": "mysql", 
    'freezeTableName': true
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "yocdb",
    "host": "127.0.0.1",
    "dialect": "mysql", 
    'freezeTableName': true
  }
};