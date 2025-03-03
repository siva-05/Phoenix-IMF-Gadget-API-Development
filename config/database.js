const { Sequelize } = require('sequelize');
require('dotenv').config();


const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT; 
const DATABASE = process.env.DATABASE;

const DATABASE_URL = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DATABASE}`;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // dialectOptions: {
  //   ssl: { rejectUnauthorized: false } // Required for cloud-hosted DBs
  // }
});

module.exports = sequelize;
