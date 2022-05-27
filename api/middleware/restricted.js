const {JWT_SECRET }= require('../secrets')
const jwt = require('jsonwebtoken');
const Users = require('../users/users-model')

exports.restricted = async function restricted (req, res, next) {
  if(req.headers.authorization) {
    try{
      req.decodedJWT = await jwt.verify(req.headers.authorization, JWT_SECRET)
      next()
    }catch(err){
      next({status:401, message:'token invalid'});
      return
    }
  }else{
    next({status:401, message: 'token required'});
  }
  /*

    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
 
};

exports.validatePost = function validatePost (req, res, next) {
   if(req.body.username == null || req.body.password == null) {
    res.status(400).json({message: 'username and password required'})
    return
   }else{
     next();
   }
 }


exports.checkUsernameAvailable = async function checkNameAvailable (req, res, next) {
    try{
      let {username} = req.body
      let alreadyExists = await Users.findBy({username}).first() != null;

      if(alreadyExists) {
        next({ status: 422, message: 'username taken'})
      }next()
    }catch(err){
      next(err)
    }
 }

 exports.usernameExists = async function usernameExists (req, res, next) {
   try {
     let {username} = req.body
     let alreadyExists = await Users.findBy({username}).first()

     if(alreadyExists==null) {
       next({ status: 401, message: 'invalid credentials'})
     }next()
   } catch (error) {
     next(error)
   }
 }
