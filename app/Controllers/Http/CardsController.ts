import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Card from 'App/Models/Card'
import List from 'App/Models/List'
import StoreCardValidator from 'App/Validators/StoreCardValidator'
import Logger from '@ioc:Adonis/Core/Logger'

export default class CardsController {
  public async reorder({ request, response }: HttpContextContract) {
    const { cardIds, listId } = request.only(['cardIds', 'listId'])

    const cards = await Card.query().whereIn('id', cardIds)
    const promises = cards.map((card) => {
      card.order = cardIds.indexOf(card.id)
      card.listId = listId
      return card.save()
    })

    await Promise.all(promises)

    return response.noContent()
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const { listId, name } = await request.validate(StoreCardValidator)
    await List.findOrFail(listId)
    const lastCardInList = await Card.query().where({ listId }).orderBy('order', 'desc').first()

    const order = lastCardInList ? lastCardInList.order + 1 : 0

    const card = await Card.create({
      ownerId: auth.user?.id,
      listId,
      name,
      order,
    })

    return card
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const card = await Card.findOrFail(params.id)

    if (auth.user?.id !== card.ownerId) return response.forbidden()

    await card.delete()

    Logger.info(`Deleting card ${params.id}`)

    return response.ok(params.id)
  }

  public async update({ params, response, request, auth }: HttpContextContract) {
    const { name } = request.only(['name'])
    const card = await Card.query()
      .where({ id: params.id })
      .preload('list', (listQuery) =>
        listQuery.preload('board', (boardQuery) => boardQuery.preload('members'))
      )
      .firstOrFail()

    if (await !card.list.board.isUserMember(auth.user!)) return response.forbidden()

    card.name = name
    await card.save()

    Logger.info(`Updating card ${card.name} to ${name}`)

    return response.ok(params.id)
  }
}
