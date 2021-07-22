import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const status = 403
const message = 'Invalid credentials'
const code = 'INVALID_CREDENTIALS'

export default class InvalidCredentialsExcepiton extends Exception {
  constructor() {
    super(message, status, code)
  }

  public async handle(_: this, ctx: HttpContextContract) {
    ctx.response.status(status).json({ message, code })
  }
}
