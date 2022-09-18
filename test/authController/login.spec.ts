import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import { BASE_URL } from '../utils'

const { email, password } = {
  email: 'johndoe@gmail.com',
  password: 'test123',
}

test.group('AuthController.login', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('return 403 when email is not verified', async (assert) => {
    const user = await User.findBy('email', email)
    user!.emailVerifiedAt = null
    await user?.save()

    const { body } = await supertest(BASE_URL).post('/login').send({ email, password }).expect(403)
    assert.equal(body.code, 'EMAIL_NOT_VERIFIED')
  })
})
