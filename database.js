import mysql from 'mysql2'

import dotenv from 'dotenv'

dotenv.config()
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.PASS,
    database: process.env.DATABASE
}).promise()

export async function getUserFromDatabase(username,password) {
    const [rows] = await pool.query("SELECT * FROM klient WHERE username = ? AND haslo=?", [username,password]);
    return rows;
}


export { pool };



