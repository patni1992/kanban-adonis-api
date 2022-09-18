import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'
import { login } from '../../utils'

const url = '/register'
let fakeMailer = Mail.fake()

const { firstName, lastName, email, password } = {
  email: 'johndoe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'test123',
}

test.group('AuthController.register', (group) => {
  group.each.setup(async () => {
    fakeMailer = Mail.fake()
    await Database.beginGlobalTransaction()
    return async () => {
      Mail.restore()
      await Database.rollbackGlobalTransaction()
    }
  })

  test('return 422 when password is less then 6 characters', async ({ client, assert }) => {
    const response = await client.post(url).json({ email, firstName, lastName, password: 'test' })

    const [error] = response.body().errors
    response.assertStatus(422)
    assert.equal(error.rule, 'minLength')
    assert.equal(error.field, 'password')
    assert.equal(error.args.minLength, 6)
  })

  test('return 422 when firstName is missing', async ({ assert, client }) => {
    const response = await login(client.post(url).json({ email, lastName, password }))

    const [error] = response.body().errors
    response.assertStatus(422)
    assert.equal(error.rule, 'required')
    assert.equal(error.field, 'firstName')
  })

  test('return 422 when lastName is missing', async ({ assert, client }) => {
    const response = await client.post(url).json({ email, firstName, password })

    const [error] = response.body().errors
    response.assertStatus(422)
    assert.equal(error.rule, 'required')
    assert.equal(error.field, 'lastName')
  })

  test('return 422 when email is missing', async ({ client, assert }) => {
    const response = await client.post(url).json({ firstName, lastName, password })

    const [error] = response.body().errors
    response.assertStatus(422)
    assert.equal(error.rule, 'required')
    assert.equal(error.field, 'email')
  })

  test('return 422 when email is not valid', async ({ assert, client }) => {
    const response = await client.post(url).json({ firstName, lastName, password, email: 'jondoe' })

    const [error] = response.body().errors
    response.assertStatus(422)
    assert.equal(error.rule, 'email')
    assert.equal(error.field, 'email')
  })

  test('saves a user to the database when successfull', async ({ assert, client }) => {
    const response = await client.post(url).json({ firstName, lastName, password, email })

    const user = await User.findBy('email', email)
    response.assertStatus(200)
    assert.equal(user?.firstName, firstName)
    assert.equal(user?.lastName, lastName)
    assert.equal(user?.email, email)
    assert.equal(user?.emailVerifiedAt, null)
  })

  test('password gets hashed when successfull', async ({ client, assert }) => {
    const response = await client.post(url).json({ firstName, lastName, password, email })

    const user = await User.findBy('email', email)

    response.assertStatus(200)
    assert.notEqual(user?.password, password)
  })

  test('sends email to user when successfull', async ({ client, assert }) => {
    const response = await client.post(url).json({ firstName, lastName, password, email })

    response.assertStatus(200)
    assert.isTrue(
      fakeMailer.exists(
        (mail) =>
          mail.subject === 'Please verify your email' &&
          mail.to?.[0].address === email &&
          mail.html?.includes(email) === true
      )
    )
  })
})
