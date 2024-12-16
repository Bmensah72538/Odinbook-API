import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/users';

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

const issueRefresh = async function(user) {
  const _id = user._id;
  const expiresIn = '1d'
  const payload = {
    sub: user._id,
    iat: Date.now(),
  }
  const output = {};

  output.token = 'Bearer ' + jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiresIn});
  output.expiresIn = expiresIn;
  try {
    const refreshUser = await User.findById(_id);
    refreshUser.refreshTokens.push(newRefreshToken);
    await refreshUser.save();
  } catch (error) {
    console.log(`Unable to save refresh token to user. ${user._id}`);
  }


  return output
}

function authJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (typeof authHeader == 'string' ) {
    const token = authHeader.split(' ')[1];
  } else {
    console.log('Error: Auth header is not a string');
    console.log(req);
  }
  jwt.verify(token, process.env.secret, (err, user) => {
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