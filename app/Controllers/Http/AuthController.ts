import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import RegisterValidator from 'App/Validators/RegisterValidator'
import EmailNotVerifiedException from 'App/Exceptions/EmailNotVerifiedException'
import InvalidCredentialsExcepiton from 'App/Exceptions/InvalidCredentialsExcepiton'

export default class AuthController {
  public async register({ request }: HttpContextContract) {
    const validatedData = await request.validate(RegisterValidator)

    const user = await User.create(validatedData)

    user.sendVerificationEmail()

    return { email: user.email }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    const user = await User.findBy('email', email)

    if (user && !user.emailVerifiedAt) {
      throw new EmailNotVerifiedException()
    }

    try {
      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '7days',
      })

      return token
    } catch (e) {
      throw new InvalidCredentialsExcepiton()
    }
  }

  public async verfiyEmail({ request, response, params }: HttpContextContract) {
    if (request.hasValidSignature()) {
      const user = await User.findByOrFail('email', params.email)
      user.emailVerifiedAt = DateTime.local()
      await user.save()
      return 'ok'
    }

    response.unauthorized()
  }
}
