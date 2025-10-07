require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.query('SELECT NOW() AS currentTime', (err, results) => {
  if (err) throw err;
  console.log('Heure actuelle depuis MariaDB:', results[0].currentTime);
  connection.end();
});
