import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { test } from '@japa/runner'

const { email, password } = {
  email: 'johndoe@gmail.com',
  password: 'test123',
}

const url = '/login'

test.group('AuthController.login', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('return 403 when email is not verified', async ({ client, assert }) => {
    const user = await User.findBy('email', email)
    user!.emailVerifiedAt = null
    await user?.save()

    const response = await client.post(url).json({ email, password })
    response.assertStatus(403)
    assert.equal(response.body().code, 'EMAIL_NOT_VERIFIED')
  })
})
