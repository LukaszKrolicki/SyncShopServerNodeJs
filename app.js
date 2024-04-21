import express from 'express';
import { pool } from './database.js';
import {
     getUserFromDatabase
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
    res.status(200).json({ message: 'Login successful' });
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

app.get('/protected-route', ensureAuthenticated, function(req, res){
    res.send('You have accessed the protected route!');

});

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

app.get('/protected-route2', ensureAuthenticatedAndAdmin, function(req, res){
    res.send('You have accessed the protected route for Admin!');
});
app.get('/un_protected-route', function(req, res){
    res.send('You have accessed the protected route2!');
});
