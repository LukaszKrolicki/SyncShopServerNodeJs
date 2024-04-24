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

export async function createUser(imie, nazwisko, email,username,haslo){
    const [result] = await  pool.query("Insert into klient (imie, nazwisko, email,username,haslo,typ) values (?,?,?,?,?,?)", [imie, nazwisko, email,username,haslo,"-"])
}
export async function createList(idTworcy, nazwa, dataPocz, dataKon){;
    const [result] = await  pool.query("Insert into listazakupow (idTworcy, Nazwa, dataPocz, dataKon) values (?,?, ?, ?)", [idTworcy, nazwa, dataPocz, dataKon])
}

export { pool };



