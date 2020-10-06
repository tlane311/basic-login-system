const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 1000;
const exphbs = require('express-handlebars');

const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');

const users = [];

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id===id)
)








app.set('views', path.join(__dirname, "../", "public", 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: "secret",//process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());




const server = app.listen(port, () =>{
    console.log(`Server is up and running on port ${port}`);
})

//WELCOME PAGE
app.get('/', checkAuthenticated, (req,res) => {
    res.render('home', {
    });
});


// LOGIN
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login")
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
}))


// REGISTRATION
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register")
})
app.post('/register', checkNotAuthenticated, async (req,res) => {
    console.log("registration attempted")
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            email: req.body.email,
            password: hashedPassword
        })

        res.redirect('/login')
    } catch {
        res.redirect('register')
    } finally {
        console.log(users)
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


