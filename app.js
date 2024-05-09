import express from 'express';
import {checkPassword, pool, setFriendRequestStatus, updateUser, updateUserPass} from './database.js';
import {
    getUserFromDatabase,
    createUser,
    createList,
    getUserByUsername,
    createInvite,
    getFriendRequests,
    createFriendBind,
    getFriends,
    deleteFriend,
    createListBind
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

app.use(passport.initialize());
app.use(passport.session());



passport.use(new LocalStrategy(

    async function(username, password, done) {
        console.log(username + " " + password);
        const user = await getUserFromDatabase(username, password);
        if (user.length === 0) {
            return done(null, false, { message: 'Incorrect credentials.' });
        }
        return done(null, user);
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
    console.log("logowanko")
    res.send(req.user)
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

app.get('/getFriends/:userId', ensureAuthenticated, async function (req, res) {
    const id = req.params.userId;
    const friendList = await getFriends(id);
    res.send(friendList)
});

app.post("/createUser", async (req, res) => {
    const {imie, nazwisko, email,username,haslo} = req.body;
    try {
        const user = await createUser(imie, nazwisko, email,username,haslo);
        res.status(201).send("user created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating user");
    }
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
        const list = await updateUserPass(idUser, password);
        res.status(201).send("Updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error update");
    }
});

app.post('/checkPassword', async (req, res) => {
    const { username, password } = req.body;
    const isPasswordCorrect = await checkPassword(username, password);
    if (isPasswordCorrect) {
        res.status(200).send({ message: 'Password is correct' });
    } else {
        res.status(401).send({ message: 'Password is incorrect' });
    }
});