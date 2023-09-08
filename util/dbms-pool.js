const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sam@123',
  database: 'dbms',
  waitForConnections: true,
  connectionLimit: 20, // Adjust the connection limit as needed
  queueLimit: 0
});

module.exports = pool.promise();