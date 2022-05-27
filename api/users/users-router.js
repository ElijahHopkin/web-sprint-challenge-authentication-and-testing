const express = require('express')
const Users = require('./users-model')

const router = express.Router();

router.get('/', (req, res, next) => {
    Users.findAll()
        .then(result => {
            res.json(result)
        })
        .catch(next)
})

module.exports= router