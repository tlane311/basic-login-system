const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function initialize(passport, getUserByEmail, getUserByID){
    const authenticateUser = async (email,password,done) => {
        const user = getUserByEmail(email);
        if (user === null) {
            return done(null, false, { message: 'Bad Credentials' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Bad Credentials' });
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