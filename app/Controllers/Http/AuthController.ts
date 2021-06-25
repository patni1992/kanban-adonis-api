import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from 'App/Models/User'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class AuthController {
  public async register({ request, auth }: HttpContextContract) {
    const validatedData = await request.validate(RegisterValidator)

    const newUser = await new User().fill(validatedData).save()

    return newUser
  }
}
