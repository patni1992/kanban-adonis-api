import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import Mail from '@ioc:Adonis/Addons/Mail'
import { BASE_URL } from '../utils'

const { firstName, lastName, email, password } = {
  email: 'johndoe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'test123',
}

test.group('AuthController.register', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
    Mail.restore()
  })

  test('return 422 when password is less then 6 characters', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/register')
      .send({ email, firstName, lastName, password: 'test' })
      .expect(422)

    const [error] = body.errors
    assert.equal(error.rule, 'minLength')
    assert.equal(error.args.minLength, 6)
  })

  test('return 422 when firstName is missing', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/register')
      .send({ email, lastName, password })
      .expect(422)

    const [error] = body.errors
    assert.equal(error.rule, 'required')
    assert.equal(error.field, 'firstName')
  })

  test('return 422 when lastName is missing', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/register')
      .send({ email, firstName, password })
      .expect(422)

    const [error] = body.errors
    assert.equal(error.rule, 'required')
    assert.equal(error.field, 'lastName')
  })

  test('return 422 when email is missing', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/register')
      .send({ firstName, lastName, password })
      .expect(422)

    const [error] = body.errors
    assert.equal(error.rule, 'required')
    assert.equal(error.field, 'email')
  })

  test('return 422 when email is not valid', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/register')
      .send({ firstName, lastName, password, email: 'jondoe' })
      .expect(422)

    const [error] = body.errors

    assert.equal(error.rule, 'email')
    assert.equal(error.field, 'email')
  })

  test('saves a user to the database when successfull', async (assert) => {
    Mail.trap(() => {})
    await supertest(BASE_URL)
      .post('/register')
      .send({ firstName, lastName, password, email })
      .expect(200)

    const user = await User.findBy('email', email)

    assert.equal(user?.firstName, firstName)
    assert.equal(user?.lastName, lastName)
    assert.equal(user?.email, email)
    assert.equal(user?.emailVerifiedAt, null)
  })

  test('password gets hashed when successfull', async (assert) => {
    Mail.trap(() => {})
    await supertest(BASE_URL)
      .post('/register')
      .send({ firstName, lastName, password, email })
      .expect(200)

    const user = await User.findBy('email', email)

    assert.notEqual(user?.password, password)
  })

  test('sends email to user when successfull', async (assert) => {
    let emailAddress
    let html

    Mail.trap((mail) => {
      emailAddress = mail.to?.[0].address
      html = mail.html
    })

    await supertest(BASE_URL)
      .post('/register')
      .send({ firstName, lastName, password, email })
      .expect(200)

    assert.equal(emailAddress, email)
    assert.include(html, email)
  })
})
