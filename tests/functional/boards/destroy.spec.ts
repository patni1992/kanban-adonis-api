import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import User from 'App/Models/User'
import { test } from '@japa/runner'
import { login } from '../../utils'

const boardName = 'test-board-test'
const url = '/boards'

test.group('BoardsController.destroy', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return 401 when not authenticated', async ({ client, assert }) => {
    const board = await Board.create({ name: boardName, ownerId: 1 })
    const response = await client.delete(`${url}/${board.id}`)
    const notDeletedBoard = await Board.find(board.id)

    response.assertStatus(401)
    assert.equal(board.id, notDeletedBoard?.id)
  })

  test('should return 403 forbidden when user is not owner', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@email.com',
      password: '1234',
    })
    const board = await Board.create({ name: boardName, ownerId: user.id })
    const response = await login(client.delete(`${url}/${board.id}`))
    const notDeletedBoard = await Board.find(board.id)

    response.assertStatus(403)
    assert.equal(board.id, notDeletedBoard?.id)
  })

  test('should delete board when user is owner', async ({ assert, client }) => {
    const board = await Board.create({ name: boardName, ownerId: 1 })
    const response = await login(client.delete(`${url}/${board.id}`))
    const deletedBoard = await Board.find(board.id)

    response.assertStatus(200)
    assert.equal(deletedBoard, null)
  })
})
