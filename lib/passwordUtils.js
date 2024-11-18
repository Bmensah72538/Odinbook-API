// import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const validPassword = async function(password, user) {
  
  let result = bcrypt.compare(password, user.password);
  return result;
  
  }

const issueAccess = function(user) {
  const _id = user._id;
  const expiresIn = '10m'
  const payload = {
    sub: user._id,
    iat: Date.now(),
  }
  const output = {};

  output.token = 'Bearer ' + jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: expiresIn});
  output.expiresIn = expiresIn;

  return output
}

const issueRefresh = function(user) {
  const _id = user._id;
  const expiresIn = '1d'
  const payload = {
    sub: user._id,
    iat: Date.now(),
  }
  const output = {};

  output.token = 'Bearer ' + jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiresIn});
  output.expiresIn = expiresIn;

  return output
}

function authJWT(req, res, next) {
  const authHeader = req.headers['authorization'].split(' ')[1];
  jwt.verify(authHeader, process.env.secret, (err, user) => {
      if (err) {
          return res.sendStatus(403)
      }
      req.user = user;
      next()
  })
}

export default {
  validPassword,
  issueAccess,
  issueRefresh,
  authJWT
}