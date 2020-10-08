const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initialize(passport, getUserByEmail, getUserByID){
    const authenticateUser = async (email,password,done) => {
        const user = getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'Invalid Email or Password' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid Email or Password' });
            }
        } catch (err) {
            return done(err)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser));
    passport.serializeUser( (user, done) => done(null, user.id) );
    passport.deserializeUser( (id, done) => done(null, getUserByID(id)));
}

module.exports = initialize