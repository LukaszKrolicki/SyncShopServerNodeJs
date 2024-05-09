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
    const [result] = await  pool.query("Insert into listazakupow (idTworcy, Nazwa, dataPocz, dataKon) values (?,?, ?, ?)", [idTworcy, nazwa, "-", "-"])
    return result.insertId;
}

export async function getUserByUsername(username) {
    try {
        const [rows] = await pool.query("SELECT idKlienta, imie, nazwisko, email, typ, username FROM klient WHERE LOWER(username) LIKE LOWER(?)", [username+"%"]);
        console.log(rows); // Check the result
        return rows
        // Process the result further if needed
    } catch (error) {
        console.error("Error executing SQL query:", error);
        // Handle the error gracefully
    }
}
export async function createInvite(idZapraszajacego, idZapraszonego, username){
    const [result] = await  pool.query("Insert into zaproszenie (idZapraszajacego, idZaproszonego, username,status) values (?,?, ?,?)", [idZapraszajacego, idZapraszonego,username,"brak"])
}

export async function getFriendRequests(idZaproszonego) {
    const [rows] = await pool.query("SELECT * FROM zaproszenie WHERE idZaproszonego = ? AND status = 'brak' ", [idZaproszonego]);
    return rows;
}
export async function getFriends(idK) {
    const [rows] = await pool.query("SELECT idKlienta, imie, nazwisko, email, typ, username FROM klient WHERE idKlienta IN (SELECT CASE WHEN idZnajomego1 = ? THEN idZnajomego2 ELSE idZnajomego1 END AS idZnajomego FROM znajomi WHERE idZnajomego1 = ? OR idZnajomego2 = ? );", [idK,idK,idK]);
    return rows;
}

export async function setFriendRequestStatus(idZapraszajacego, idZapraszonego,status) {
    const [rows] = await pool.query("UPDATE zaproszenie SET status= ? WHERE idZaproszonego = ? AND idZapraszajacego = ?  ", [status,idZapraszonego,idZapraszajacego]);
    return rows;
}

export async function createFriendBind(idZnaj1, idZnaj2){
    const [result] = await  pool.query("Insert into znajomi (idZnajomego1, idZnajomego2) values (?,?)", [idZnaj1, idZnaj2])
}
export async function deleteFriend(idZnaj,idZnaj2){
    const [result] = await  pool.query("DELETE FROM znajomi WHERE (idZnajomego1=? AND idZnajomego2=?) OR (idZnajomego1=? AND idZnajomego2=?)", [idZnaj,idZnaj2,idZnaj2,idZnaj])
}

export async function createListBind(idK, idL){
    const [result] = await  pool.query("Insert into listazakupow_klient (idKlienta, idListy) values (?,?)", [idK, idL])
}

export async function updateUser(idUser, email,name,surname) {
    const [rows] = await pool.query("UPDATE klient SET imie= ?, nazwisko=?, email=? WHERE idKlienta = ? ", [name,surname,email,idUser]);
    return rows;
}

export async function updateUserPass(idUser, password) {
    const [rows] = await pool.query("UPDATE klient SET haslo=? WHERE idKlienta = ? ", [password,idUser]);
    return rows;
}

export async function checkPassword(username, password) {
    const [rows] = await pool.query("SELECT * FROM klient WHERE username = ? AND haslo=?", [username, password]);
    return rows.length > 0;
}

export { pool };



