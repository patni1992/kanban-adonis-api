import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Board from 'App/Models/Board'
import Card from 'App/Models/Card'
import StoreBoardValidator from 'App/Validators/StoreBoardValidator'

export default class CardsController {
  public async reorder({ auth, request, response }: HttpContextContract) {
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
}
