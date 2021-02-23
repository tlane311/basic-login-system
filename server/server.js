require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 1000;
const exphbs = require('express-handlebars');

const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash')
const users = [];

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id===id)
)


app.set('views', path.join(__dirname, "../", "public", 'views'));
app.use(express.static(path.join(__dirname, `../`, `/public`, `views`)));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());




const server = app.listen(port, () =>{
    console.log(`Server is up and running on port ${port}`);
})

//WELCOME PAGE
app.get('/', checkAuthenticated, (req,res) => {
    res.render('home', {
        user: req.user.username
    });
});


// LOGIN
app.get('/login', checkNotAuthenticated, (req, res) => {
    const errors = req.flash().error || [];
    res.render("login", {errors: errors})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


// REGISTRATION
app.get('/register', checkNotAuthenticated, (req, res) => {
    
    res.render("register");
})
app.post('/register', checkNotAuthenticated, async (req,res) => {
    try{
        if (users.find(element => element.email === req.body.email)) {
            throw 'Email already in use';
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword
        })

        res.redirect('/login')
    } catch(e) {
        res.render('register', {errors: e})
    }
})


app.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login')
})



function checkAuthenticated(req,res,next) {
    if (req.isAuthenticated()) {
        return next()
    }

    return res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    return next()
}


