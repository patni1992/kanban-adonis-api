import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const status = 403
const message = 'Email not verified'
const code = 'EMAIL_NOT_VERIFIED'

export default class EmailNotVerifiedException extends Exception {
  constructor() {
    super(message, status, code)
  }

  public async handle(_: this, ctx: HttpContextContract) {
    ctx.response.status(status).json({ message, code })
  }
}
