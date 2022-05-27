const db = require('../../data/dbConfig')


function findAll () {
    return db('users')
}

function findBy(filter) {
    return db('users').where(filter);
}

function findById(id) {
    return db('users').where('id', id).first()
}

async function add  (user) {
    const [id] = await db('users').insert({username: user.username, password: user.password})
    return findById(id)
}



module.exports ={
    findAll,
    findBy,
    findById,
    add
}