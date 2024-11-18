import passport from 'passport'
import passportJwt from 'passport-jwt'
import util from '../lib/passwordUtils.js'
import User from '../models/user.js'

let JwtStrategy = passportJwt.Strategy;
let ExtractJwt = passportJwt.ExtractJwt;

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
opts.issuer = 'accounts.examplesoft.com';
opts.audience = 'yoursite.net';

const strategy = new JwtStrategy(opts, function(jwt_payload, done) {
    console.log('payload',jwt_payload);
  User.findOne({id: jwt_payload.sub}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
          // or you could create a new account
      }
  });
})


passport.use(strategy);
  
passport.serializeUser(function(user, cb) {
cb(null, {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    isMember: user.isMember
})
});

passport.deserializeUser(async function(session, cb) {
await User.findById(session.id)
    .then((user) => {
    cb(null, user)
    })
    .catch((err) => {
    cb(err);
    })
});