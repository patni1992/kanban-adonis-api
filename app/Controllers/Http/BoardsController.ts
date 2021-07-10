import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Board from 'App/Models/Board'
import StoreBoardValidator from 'App/Validators/StoreBoardValidator'

export default class BoardsController {
  public async index({ auth }: HttpContextContract) {
    const boards = await auth.user?.related('boards').query().orderBy('created_at', 'desc')

    return boards
  }

  public async show({ auth, params, response }: HttpContextContract) {
    const board = await Board.query()
      .where('id', params.id)
      .preload('members')
      .preload('lists')
      .firstOrFail()

    const userIsMember = await board.isUserMember(auth.user!)

    if (!userIsMember) return response.forbidden()

    return response.json(board)
  }

  public async store({ request }: HttpContextContract) {
    const validatedData = await request.validate(StoreBoardValidator)
    const board = await Board.create(validatedData)

    return board
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const board = await Board.findOrFail(params.id)

    if (auth.user?.id !== board.ownerId) return response.forbidden()

    await board.delete()
    return response.ok(params.id)
  }
}
