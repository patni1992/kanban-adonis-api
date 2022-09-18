import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

async function login() {
  const { body } = await supertest(BASE_URL)
    .post('/login')
    .send({ email: 'johndoe@gmail.com', password: 'test123' })

  return body.token
}

export { BASE_URL, login }
