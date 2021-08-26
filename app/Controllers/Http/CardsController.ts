import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Card from 'App/Models/Card'

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
}
