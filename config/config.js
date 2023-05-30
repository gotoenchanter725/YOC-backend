require('dotenv').config();

const database = process.env.NET_WORK == "ETH" ? "yocdb-eth" : "yocdb-bsc";
console.log("Database:", database);

module.exports = {
  "development": {
    "username": "root",
    "password": null,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql", 
    'freezeTableName': true, 
    "logging": false
  },
  "test": {
    "username": "root",
    "password": "friend.b617",
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql", 
    'freezeTableName': true, 
    "logging": false
  },
  "production": {
    "username": "root",
    "password": null,
    "database": database,
    "host": "127.0.0.1",
    "dialect": "mysql", 
    'freezeTableName': true, 
    "logging": false
  }
};