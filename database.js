import mysql from 'mysql2'

import dotenv from 'dotenv'

dotenv.config()
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.PASS,
    database: process.env.DATABASE
}).promise()

export async function getUserFromDatabase(username) {
    const [rows] = await pool.query("SELECT * FROM klient WHERE username=?", [username]);
    return rows;
}

export async function userExists(username, email) {
    const [rows] = await pool.query("SELECT * FROM klient WHERE username = ? OR email=?", [username, email]);
    return rows.length > 0;
}

export async function userEmailExists(email) {
    const [rows] = await pool.query("SELECT username FROM klient WHERE email=?", [email]);
    return rows.length > 0;
}
export async function createUser(imie, nazwisko, email,username,haslo){
    const [result] = await  pool.query("Insert into klient (imie, nazwisko, email,username,haslo,typ) values (?,?,?,?,?,?)", [imie, nazwisko, email,username,haslo,"-"])
}
export async function createList(idTworcy, nazwa, dataPocz, dataKon){
    const [result] = await  pool.query("Insert into listazakupow (idTworcy, Nazwa, dataPocz, dataKon) values (?,?, ?, ?)", [idTworcy, nazwa, dataPocz, dataKon]);
    const [result2] = await  pool.query("Insert into listazakupow_klient (idListy, idKlienta) values (LAST_INSERT_ID(),?)", [idTworcy]);
    const [rows] = await pool.query("SELECT LAST_INSERT_ID() as id");
    return rows[0].id;
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

export async function createShoppingInvite(idZapraszajacego, idListy,idZapraszanego){
    const [result] = await  pool.query("Insert into zaproszenie_do_listy (idZapraszajacego, idListy,idZapraszanego) values (?,?,?)", [idZapraszajacego, idListy,idZapraszanego])
}
export async function getShoppingRequests(idZaproszonego) {
    const [rows] = await pool.query("SELECT * FROM zaproszenie_do_listy WHERE idZapraszanego = ?", [idZaproszonego]);
    return rows;
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
export async function getLists(idK) {
    const [rows] = await pool.query("SELECT idListy, idTworcy, Nazwa, dataPocz, dataKon FROM listazakupow WHERE idListy IN (SELECT idListy FROM listazakupow_klient WHERE idKlienta = ?);", [idK]);
    return rows;
}
export async function deleteShoppingList(idKli, idListy){
    const [result] = await  pool.query("DELETE FROM listazakupow_klient WHERE idKlienta = ? AND idListy = ?", [idKli, idListy])
}
export async function deleteAllEntriesWithIdListy(idListy, userId){
    // Check if the user is the author of the list
    const [rows] = await pool.query("SELECT idTworcy FROM listazakupow WHERE idListy = ?", [idListy]);
    if (rows.length > 0 && rows[0].idTworcy === userId) {
        // User is the author, proceed with deletion
        // Delete from listazakupow_klient table
        const [result1] = await pool.query("DELETE FROM listazakupow_klient WHERE idListy = ?", [idListy]);
        // Delete from listazakupow table
        const [result2] = await pool.query("DELETE FROM listazakupow WHERE idListy = ?", [idListy]);
    } else {
        const [result] = await  pool.query("DELETE FROM listazakupow_klient WHERE idListy = ? AND idKlienta = ?", [idListy, userId])
    }
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

export async function deleteShoppingListNotification(idKli, idListy){
    const [result] = await  pool.query("DELETE FROM zaproszenie_do_listy WHERE idListy = ? AND idZapraszajacego = ?", [idListy,idKli])
}

export async function addProduct(idListy, idKlienta,nazwaTworzacego,nazwa,cena,ilosc,notatka,sklep,status){
    const [result] = await  pool.query("Insert into produkt (idListy, idKlienta,nazwaTworzacego,nazwa,cena,ilosc,notatka,sklep,status) values (?,?,?,?,?,?,?,?,?)", [idListy, idKlienta,nazwaTworzacego,nazwa,cena,ilosc,notatka,sklep,status])
    const [rows] = await pool.query("SELECT LAST_INSERT_ID() as id");
    return rows[0].id;
}

export async function retrieveProductsFromList(idListy,status){
    const [rows] = await  pool.query("SELECT idProduktu,idListy, idKlienta,nazwaTworzacego,nazwa,cena,typ,ilosc,notatka,sklep,status,nazwaRezerwujacego, nazwaKupujacego FROM produkt where idListy=? and status=?", [idListy,status]);
    return rows;
}

export async function setProductStatus(idListy,idProduktu,nazwa,status){
    if(status=="reserved"){
        const [rows] = await  pool.query("UPDATE produkt SET status=?, nazwaRezerwujacego=? WHERE idListy=? and idProduktu=?", [status,nazwa,idListy,idProduktu]);
    }
    else if(status=="bought"){
        const [rows] = await  pool.query("UPDATE produkt SET status=?, nazwaKupujacego=? WHERE idListy=? and idProduktu=?", [status,nazwa,idListy,idProduktu]);
    }
    else{
        const [rows] = await  pool.query("UPDATE produkt SET status=?,nazwaKupujacego=?, nazwaRezerwujacego=? WHERE idListy=? and idProduktu=?", [status,"-","-",idListy,idProduktu]);
    }
    return "ok";
}
export async function deleteProduct(idProduct, idList){
    const [result] = await  pool.query("DELETE FROM produkt WHERE (idProduktu=? AND idListy=?)", [idProduct, idList])
}

export async function createReport(idK, opis,username){
    const [result] = await  pool.query("Insert into raport (idKlienta, opis,username) values (?,?,?)", [idK, opis,username])
}

export async function updateUserPassRetrieve(password,email) {
    const [rows] = await pool.query("UPDATE klient SET haslo=? WHERE email = ? ", [password,email]);
    return rows;
}



export { pool };


export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM klient WHERE typ ='-'");
    return rows;
}
export async function deleteUser(idKli){
    const [result] = await  pool.query("DELETE FROM klient WHERE idKlienta=?", [idKli])
}
