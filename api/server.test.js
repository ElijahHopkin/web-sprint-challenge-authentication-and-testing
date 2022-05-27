const db = require('../data/dbConfig');
const server = require('./server')
const request = require('supertest');
const JokesRoutes = require('../api/jokes/jokes-router')
const AuthRoutes = require('../api/auth/auth-router');
const Middleware = require('../api/middleware/restricted')
const Users = require('../api/users/users-model')
// Write your tests here

let testUser = {username: 'jonny', password: '1234'}
const incompleteUser = {username: 'sandra'}

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async() => {
  await db('users').truncate();
})

afterAll( async () => {
  await db.destroy();
})

test('sanity', () => {
  expect(true).toBe(true)
})
describe('server.js' , () => {
  test('server is up', async() => {
    let response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual('server is up')
  });
  describe('POST /api/auth/register', () => {
   
    test('adds a newUser to users table with username and password', async() => {
      let response;
     response = await request(server).post('/api/auth/register').send(testUser);
     let newUser = await db('users').first();
    //  console.log(newUser);
      expect(response.status).toBe(201);
      expect(newUser).toHaveProperty('username', 'jonny')
      expect(newUser).toHaveProperty('id');
      expect(newUser).toHaveProperty('password')
      expect(newUser.password).toMatch(/^\$2[ayb]\$.{56}$/)//regex for password bcrypt
      
      await request(server).get('/api/users')
      let userTable = await db('users')
      expect(userTable).toHaveLength(1);
    })
    test('rejects and incomplete registration, and returns the proper error', async () => {
      let response = await request(server).post('/api/auth/register').send(incompleteUser);
      let newUser = await db('users').first();
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({message: 'username and password required'});
      expect(newUser).toBeUndefined();
  
      await request(server).get('/api/users')
      let userTable = await db('users')
      expect(userTable).toHaveLength(0)
    })
    test('rejects attempt to register if username is not unique', async() => {
      let response = await request(server).post('/api/auth/register').send(testUser);
     let newUser = await db('users').first();
      expect(response.status).toBe(201);
      expect(newUser).toHaveProperty('username', 'jonny')
      expect(newUser).toHaveProperty('id');
      expect(newUser).toHaveProperty('password')
      
      await request(server).get('/api/users')
      let userTable = await db('users')
      expect(userTable).toHaveLength(1);

      response = await request(server).post('/api/auth/register').send(testUser);
       newUser = await db('users').where('id', 2);
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({message: 'username taken'})
      expect(newUser).toHaveLength(0);

      await request(server).get('/api/users');
      userTable = await db('users');
      expect(userTable).toHaveLength(1);
    })
  
  })
  describe('POST /api/auth/login', () => {

    test('returns a token and welcome message to registered users attempting to login', async() => {
      await request(server).post('/api/auth/register').send(testUser);
      let response = await request(server).post('/api/auth/login').send(testUser);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe(`welcome, ${testUser.username}`)
    })
    test('rejects login and returns error code/message to unregistered users attempting to login', async() => {
      let response = await request(server).post('/api/auth/login').send(testUser);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body.message).toBe(`invalid credentials`)
    })
    test('rejects login and returns error code/message if login credentials incomplete', async() => {
      let response = await request(server).post('/api/auth/login').send(incompleteUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body.message).toBe(`username and password required`)
    })
  })
  describe('GET api/jokes', () => {
    // test('after registered user logs in they are able to access jokes with token', async() => {
    //   await request(server).post('/api/auth/register').send(testUser);
    //   let LOGINresponse = await request(server).post('/api/auth/login').send(testUser);
    //   let GETresponse = await request(server).get('api/jokes').send({authorization: LOGINresponse.body.token})
    //   expect(GETresponse.status).toBe(200);
      // let credentials = await (await request(server).get('/api/jokes')).set('response.header', response.body.token)
      // {...response, authorization: response.body.token}
      // console.log(credentials)
    // })
    test('request to access jokes denied if no token present. error status and message returned', async () => {
      await request(server).post('/api/auth/register').send(testUser);
      await request(server).post('/api/auth/login').send(testUser);
      let response = await request(server).get('/api/jokes')
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('token required')
    })
  })
})




