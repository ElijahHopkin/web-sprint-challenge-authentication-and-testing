const db = require('../data/dbConfig');
const server = require('./server')
const request = require('supertest');
const JokesRoutes = require('../api/jokes/jokes-router')
const AuthRoutes = require('../api/auth/auth-router');
const Middleware = require('../api/middleware/restricted')
const Users = require('../api/users/users-model')
// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

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

describe('endpoint tests', () => {
  test('server is up', async() => {
    let response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual('server is up')
  });

  test('POST /register', async() => {
    let response;
    response= await request(server).post('/auth/register').send({username: 'jonny', password: 1234});
    console.log(response)
    expect(response.status).toBe(201);
    // expect(response.body).toHaveProperty('username', 'jonny')

  })
})




