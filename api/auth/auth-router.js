const router = require('express').Router();
const {JWT_SECRET} = require('../secrets')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/users-model');
const { 
  checkUsernameAvailable, 
  validatePost, 
  usernameExists
} = require('../middleware/restricted')

router.post('/register', validatePost, checkUsernameAvailable,  async (req, res, next) => {
      try {
        const newUser = req.body
        
        const hash = bcrypt.hashSync(newUser.password, 8)
        newUser.password= hash
      
        const result = await Users.add(newUser)
        res.status(201).json(result)
      } catch (error) {
        next(error)
      }
    
   
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

      //MIDDLEWARE--validatePost
    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

      MIDDLEWARE--checkNameAvailable
    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', validatePost, usernameExists, (req, res, next) => {
  try {
    let {username, password} = req.body

    Users.findBy({username})
      .then(([user]) => {
        if(user && bcrypt.compareSync(password, user.password)) {
          const token = generateToken(user);
          res.status(200).json({ message: `Welcome, ${user.username}`, token});
        }else{
          next({status:401, message: 'invalid credentials'})
        }
      })
  } catch (error) {
    next(error)
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

      MIDDLEWARE--validatePost
    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

      MIDDLEWARE--usernameExists
    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,

  };
  const options = {
    expiresIn: '1d'
  };
  return jwt.sign(payload, JWT_SECRET, options)
}

module.exports = router;
