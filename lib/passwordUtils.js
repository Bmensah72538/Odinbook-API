import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/users.js';

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

  const output = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: expiresIn});

  return output
}

const issueRefresh = async function(user) {
  const _id = user._id;
  const expiresIn = '1d'
  const payload = {
    sub: user._id,
    iat: Date.now(),
  }

  const output = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: expiresIn});
  try {
    const refreshUser = await User.findById(_id);
    refreshUser.refreshTokens.push(output.token);
    await refreshUser.save();
  } catch (error) {
    console.log(`Unable to save refresh token to user. ${user._id}`);
    console.log(error);
  }


  return output
}

const authJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the Authorization header exists and is properly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token missing or malformed' });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the token
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ error: 'Failed to verify token' });
    }

    // Attach the decoded payload to req.user
    req.user = payload.sub;
    next(); // Proceed to the next middleware or route handler
  });
};


export default {
  validPassword,
  issueAccess,
  issueRefresh,
  authJWT
}