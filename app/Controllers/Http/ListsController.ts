import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import List from 'App/Models/List'
import Board from 'App/Models/Board'
import StoreListValidator from 'App/Validators/StoreListValidator'

export default class ListsController {
  public async index({ auth, request, response }: HttpContextContract) {
    const { boardId } = request.qs()
    if (!boardId) return response.badRequest('boardId is required')

    const board = await Board.query()
      .where('id', boardId)
      .preload('members')
      .preload('lists', (listsQuery) =>
        listsQuery.orderBy('order').preload('cards', (cardsQuery) => cardsQuery.orderBy('order'))
      )
      .firstOrFail()

    if (!(await board?.isUserMember(auth.user!))) return response.forbidden()

    return board
  }

  public async store({ request, response }: HttpContextContract) {
    const { boardId, name } = await request.validate(StoreListValidator)
    await Board.findOrFail(boardId)
    const lastListInBoard = await List.query().where({ boardId }).orderBy('order', 'desc').first()

    const order = lastListInBoard ? lastListInBoard.order + 1 : 0

    const list = await List.create({
      boardId,
      name,
      order,
    })

    return list
  }

  public async reorder({ request, response }: HttpContextContract) {
    const { listIds, boardId } = request.only(['listIds', 'boardId'])

    const lists = await List.query().where('boardId', boardId)
    const promises = lists.map((list) => {
      list.order = listIds.indexOf(list.id)
      return list.save()
    })

    await Promise.all(promises)

    return response.noContent()
  }
}
