import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    password: schema.string({ trim: true }, [rules.minLength(6)]),
    firstName: schema.string({ trim: true }),
    lastName: schema.string({ trim: true }),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.normalizeEmail({ allLowercase: true }),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
  })

  public messages = {
    'email.unique': 'Email already registered',
  }
}
