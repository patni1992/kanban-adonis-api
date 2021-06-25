import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import User from 'App/Models/User'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class AuthController {
  public async register({ request }: HttpContextContract) {
    const validatedData = await request.validate(RegisterValidator)

    const user = await new User().fill(validatedData).save()

    user.sendVerificationEmail()

    return { email: user.email }
  }

  public async verfiyEmail({ request, response, params }: HttpContextContract) {
    if (request.hasValidSignature()) {
      const user = await User.findByOrFail('email', params.email)
      user.email_verified_at = DateTime.local()
      user.save()
      return 'ok'
    }

    response.unauthorized()
  }
}
