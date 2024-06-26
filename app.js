import express from 'express';
import bcrypt, {hash} from 'bcrypt';
import nodemailer from 'nodemailer';

import {
    addProduct,
    checkPassword, createReport,
    createShoppingInvite, deleteProduct, deleteRaport, deleteShoppingListNotification, getRaports, getShoppingRequests,
    pool, retrieveProductsFromList,
    setFriendRequestStatus, setProductStatus,
    updateUser,
    updateUserPass, updateUserPassRetrieve, userEmailExists
} from './database.js';
import {
    getUserFromDatabase,
    createUser,
    userExists,
    createList,
    getUserByUsername,
    createInvite,
    getFriendRequests,
    createFriendBind,
    getFriends,
    deleteFriend,
    createListBind,
    getLists,
    deleteShoppingList,
    deleteAllEntriesWithIdListy,
    getUsers,
    deleteUser,
} from "./database.js";

import bodyParser from 'body-parser';

const app = express();

// Increase the maximum request size limit for images/pdfs
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

import session from 'express-session';

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(8080, ()=> {
    console.log('Server is running on port 8080')
})


app.use(session({
    secret: 'ABBA126677***324##__8899',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000} // 24 hours
}));

import passport from 'passport';
import LocalStrategy from 'passport-local';
import res from "express/lib/response.js";

app.use(passport.initialize());
app.use(passport.session());



// passport.use(new LocalStrategy(
//
//     async function(username, password, done) {
//         console.log(username + " " + password);
//         const user = await getUserFromDatabase(username, password);
//         if (user.length === 0) {
//             return done(null, false, { message: 'Incorrect credentials.' });
//         }
//         return done(null, user);
//     }
// ));

passport.use(new LocalStrategy(
    async function(username, password, done) {
        console.log(username + " " + password);
        const user = await getUserFromDatabase(username);
        if (user.length === 0) {
            return done(null, false, { message: 'Incorrect credentials.' });
        }

        // Compare hashed passwords
        const match = await bcrypt.compare(password, user[0].haslo);
        if(match) {
            // Passwords match
            return done(null, user);
        }
        if(user[0].haslo === password){
            return done(null, user);
        }
        else {
            // Passwords don't match
            return done(null, false, { message: 'Incorrect credentials.' });
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user[0].idKlienta);
});

passport.deserializeUser(async function(id, done) {
    const [user] = await pool.query("SELECT * FROM klient WHERE idKlienta = ?", [id]);
    done(null, user[0]);
});
app.post('/login', passport.authenticate('local'), function(req, res) {
    if (req.user) {
        console.log("logowanko")
        res.send(req.user)
    } else {
        res.status(401).send({ error: req.authInfo.message });
    }
});

app.get('/', function(req, res) {
    // You can send a response back to the client
    res.send('Welcome to the homepage!');
    // Or you can render an HTML template
    // res.render('index'); // Assuming you have a template engine set up
});
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

function ensureAuthenticatedAndAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.typ === 'Admin') {
            return next();
        } else {
            res.status(403).send('Unauthorized: Not an admin');
        }
    } else {
        res.redirect('/login');
    }
}

app.get('/protected-route', ensureAuthenticated, function(req, res){
    res.send('You have accessed the protected route!');

});

app.get('/protected-route2', ensureAuthenticatedAndAdmin, function(req, res){
    res.send('You have accessed the protected route for Admin!');
});
app.get('/un_protected-route', function(req, res){
    res.send('You have accessed the protected route2!');
});

app.get('/searchUser/:username', ensureAuthenticated, async function (req, res) {
    const username = req.params.username;
    const friendList = await getUserByUsername(username);
    res.send(friendList)
});

app.get('/getUserInvitation/:userId', ensureAuthenticated, async function (req, res) {
    const id = req.params.userId;
    const friendRequests = await getFriendRequests(id);
    res.send(friendRequests)
});

app.get('/getUserShoppingInvitation/:userId', ensureAuthenticated, async function (req, res) {
    const id = req.params.userId;
    const friendRequests = await getShoppingRequests(id);
    res.send(friendRequests)
});

app.get('/getFriends/:userId', ensureAuthenticated, async function (req, res) {
    const id = req.params.userId;
    const friendList = await getFriends(id);
    res.send(friendList)
});

app.get('/getListProducts/:listId/:status', ensureAuthenticated, async function (req, res) {
    const id = req.params.listId;
    const status = req.params.status;
    const productList = await retrieveProductsFromList(id,status);
    res.send(productList)
});


app.post("/createList", ensureAuthenticated, async (req, res) => {
    const {idTworcy, nazwa, dataPocz, dataKon} = req.body;
    try {
        const listId = await createList(idTworcy, nazwa, dataPocz, dataKon);
        res.status(201).send({ listazakupowid: listId });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating list");
    }
});
app.get('/getUserLists/:userId', ensureAuthenticated, async function (req, res) {
    const id = req.params.userId;
    const listsRequest = await getLists(id);
    res.send(listsRequest)
});
app.post("/createInvite", ensureAuthenticated, async (req, res) => {
    const {idZapraszajacego, idZapraszonego,username} = req.body;
    try {
        const list = await createInvite(idZapraszajacego, idZapraszonego,username);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin invite request");
    }
});

app.post("/createFriendBind", ensureAuthenticated, async (req, res) => {
    const {idZnaj1, idZnaj2} = req.body;
    try {
        const list = await createFriendBind(idZnaj1, idZnaj2);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin friend bind request");
    }
});

app.post("/updateInvitation", ensureAuthenticated, async (req, res) => {
    const {idZapraszajacego, idZapraszonego,status} = req.body;
    try {
        const list = await setFriendRequestStatus(idZapraszajacego, idZapraszonego,status);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin invite request");
    }
});

app.post("/deleteFriend", ensureAuthenticated, async (req, res) => {
    const {idZnaj,idZnaj2} = req.body;
    try {
        const list = await deleteFriend(idZnaj,idZnaj2);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin invite request");
    }
});


app.post("/createListBind", ensureAuthenticated, async (req, res) => {
    const {idK, idL} = req.body;
    try {
        const list = await createListBind(idK, idL);
        res.status(201).send("created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});


app.post("/createShoppingBind", ensureAuthenticated, async (req, res) => {
    const {idZapraszajacego, idListy,idZapraszanego} = req.body;
    try {
        const list = await createShoppingInvite(idZapraszajacego, idListy,idZapraszanego);
        res.status(201).send("created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

app.post("/updateUser", ensureAuthenticated, async (req, res) => {
    const {idUser, email,name,surname} = req.body;
    try {
        const list = await updateUser(idUser, email,name,surname);
        res.status(201).send("Updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error update");
    }
});

app.post("/updateUserPass", ensureAuthenticated, async (req, res) => {
    const {idUser, password} = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const list = await updateUserPass(idUser, hashedPassword);
        res.status(201).send("Updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error update");
    }
});

app.post('/checkPassword', async (req, res) => {
    const {username, password} = req.body;
    const isPasswordCorrect = await checkPassword(username, password);
    if (isPasswordCorrect) {
        res.status(200).send({message: 'Password is correct'});
    } else {
        res.status(401).send({message: 'Password is incorrect'})
    }
});

app.post("/deleteList", ensureAuthenticated, async (req, res) => {
    const {idKli,idListy} = req.body;
    try {
        const list = await deleteAllEntriesWithIdListy(idListy,idKli);
        res.status(201).send("List deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting list");

    }
    });

app.post("/deleteListNotification", ensureAuthenticated, async (req, res) => {
    const {idKli,idListy} = req.body;
    try {
        const list = await deleteShoppingListNotification(idKli,idListy);
        res.status(201).send("List deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting list");

    }
});

app.post("/addProduct", ensureAuthenticated, async (req, res) => {
    const {idListy, idKlienta,nazwaTworzacego,nazwa,cena,ilosc,notatka,sklep,status} = req.body;
    try {
        const list = await addProduct(idListy, idKlienta,nazwaTworzacego,nazwa,cena,ilosc,notatka,sklep,status);
        res.status(201).send({ productId: list });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

app.post("/updateProduct", ensureAuthenticated, async (req, res) => {
    const {idListy,idProduktu,nazwa,status} = req.body;
    try {
        const list = await setProductStatus(idListy,idProduktu,nazwa,status);
        res.status(201).send("Updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error update");
    }
});

app.post("/deleteProduct", ensureAuthenticated, async (req, res) => {
    const {idProduct, idList} = req.body;
    try {
        const list = await deleteProduct(idProduct, idList);
        res.status(201).send("deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

app.post("/createReport", async (req, res) => {
    const {idK, opis,username} = req.body;
    try {
        const user = await createReport(idK, opis,username);
        res.status(201).send("Report created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating report");
    }
});

let userCodes = {};
app.post("/sendEmail", async (req, res) => {
    const {username, email} = req.body;
    const loginCode = Math.floor(Math.random() * 1000000);

    try {
        if (await userExists(username, email)) {
            throw new Error("User with this username and email already exists");
        }
        const mail = await sendEmail(email, loginCode,"We are pleased that you want to join us :) Your login code is");
        userCodes[username] = {loginCode};
        res.status(201).send("Email sent successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sending email");
    }
});

app.post("/sendEmailRetrieve", async (req, res) => {
    const {email} = req.body;
    const retrieveCode = Math.floor(Math.random() * 1000000);

    try {
        if (await userEmailExists(email)) {
            const mail = await sendEmail(email, retrieveCode,"We have heard that you forgot your password :( How unfortunatelly... Your passsword retrieve code is");
            res.status(201).send("Email sent successfully");
            userCodes[email] = {retrieveCode};
        }
        else{
            throw new Error("User with this username and email already exists");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sending email");
    }
});

app.post("/checkRetrieveCode", async (req, res) => {
    const {passedcode,email} = req.body;
    try {
        if(passedcode==userCodes[email].retrieveCode){
            res.status(201).send("ok");
        }
        else{
            res.status(500).send("not ok");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("nooot ok");
    }
});

app.post("/createUser", async (req, res) => {
    const {imie, nazwisko, email,username,haslo, passedcode} = req.body;
    try {
        if(passedcode==userCodes[username].loginCode){
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(haslo, saltRounds);
            const user = await createUser(imie, nazwisko, email,username,hashedPassword);
            res.status(201).send("user created successfully");
        }
        else{
            res.status(500).send("Error creating user");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating user");
    }
});

app.post("/updateUserPassRetrieve", async (req, res) => {
    const {password,email} = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const list = await updateUserPassRetrieve(hashedPassword,email);
        res.status(201).send("Updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error update");
    }
});

async function sendEmail(email, loginCode,text) {
    let transporter = nodemailer.createTransport({
        service: 'gmail', // replace with your email service
        auth: {
            user: process.env.EMAIL, // replace with your email
            pass: process.env.PASSWORD // replace with your password
        }
    });

    let mailOptions = {
        from: process.env.EMAIL, // sender address
        to: email, // list of receivers
        subject: 'Syncshop registration code', // Subject line
        text: `${text}  ${loginCode}` // plain text body
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
}

app.get('/getUsersList', ensureAuthenticatedAndAdmin, async function (req, res) {
    const listsRequest = await getUsers();
    console.log(listsRequest)
    res.send(listsRequest)
});

app.post("/deleteUser", ensureAuthenticatedAndAdmin, async (req, res) => {
    const {idKli} = req.body;
    try {
        const list = await deleteUser(idKli);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin invite request");
    }
});

app.get('/getRaports', ensureAuthenticatedAndAdmin, async function (req, res) {
    const listsRequest = await getRaports();
    console.log(listsRequest)
    res.send(listsRequest)
});

app.post("/deleteRaport", ensureAuthenticatedAndAdmin, async (req, res) => {
    const {idRap} = req.body;
    try {
        const list = await deleteRaport(idRap);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin invite request");
    }
});

app.post("/updateUser", ensureAuthenticatedAndAdmin, async (req, res) => {
    const {idUser, email, name, surname} = req.body;
    try {
        const list = await updateUser(idUser, email, name, surname);
        res.status(201).send("List created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error sendin invite request");
    }
});