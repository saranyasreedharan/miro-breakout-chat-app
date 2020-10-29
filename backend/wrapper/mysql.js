/**
 * Connect to MySQL database.
 * Create the required tables
 *
 * Get config from backend/.env
 * @author Saranya Sreedharan.
 */

require('dotenv').config()

const mysql = require('mysql');
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PWD
const DB_SCHEMA = process.env.DB_SCHEMA

config = {
    host: DB_HOST,
    port : DB_PORT,
    user  : DB_USER,
    database : DB_SCHEMA,
    password: DB_PWD
}

var connection =
    mysql.createConnection(config);

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        throw err;
    }

    console.log('Connected as id ' + connection.threadId);
});

const CREATE_AUTHOR = "CREATE TABLE IF NOT EXISTS author (id  INTEGER PRIMARY KEY AUTO_INCREMENT," +
    " name VARCHAR(255) NOT NULL," +
    " CONSTRAINT author_uk UNIQUE(name));";

connection.query(CREATE_AUTHOR, function (err, result) {
    if (err) {
        console.error('Error creeting author: ' + err.stack);
        throw err;
    }
    console.log('Created table author' );
});

const CREATE_ROOM = "CREATE TABLE IF NOT EXISTS room (id  BIGINT PRIMARY KEY," +
    " isAlive SMALLINT(0) NOT NULL DEFAULT 0," +
    " created_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);";

connection.query(CREATE_ROOM, function (err, result) {
    if (err) {
        console.error('Error creeting room: ' + err.stack);
        throw err;
    }
    console.log('Created table room' );
});


const CREATE_MESSAGE = "CREATE TABLE IF NOT EXISTS message (id  INTEGER AUTO_INCREMENT PRIMARY KEY," +
    " author VARCHAR(255) NOT NULL," +
    " text TEXT NOT NULL," +
    " created_time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
    " room BIGINT NOT NULL," +
    " CONSTRAINT room_uk FOREIGN KEY (room) REFERENCES room (id)," +
    " CONSTRAINT author_fk FOREIGN KEY (author) REFERENCES author (name));";

connection.query(CREATE_MESSAGE, function (err, result) {
    if (err) {
        console.error('Error creeting message: ' + err.stack);
        throw err;
    }
    console.log('Created table message' );
});


module.exports =  {
    connection : mysql.createConnection(config)
}