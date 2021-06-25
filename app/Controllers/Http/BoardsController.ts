import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class BoardsController {
  public async index({ auth }: HttpContextContract) {
    const boards = await auth.user?.related('boards').query()

    return boards
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
