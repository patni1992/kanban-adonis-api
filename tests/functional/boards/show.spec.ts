import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import List from 'App/Models/List'
import User from 'App/Models/User'
import { test } from '@japa/runner'
import { login } from '../../utils'

const url = '/boards'

test.group('BoardsController.show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return 401 when not authenticated', async ({ client }) => {
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    const response = await client.get(`${url}/${board.id}`)
    response.assertStatus(401)
  })

  test('should return 404 when trying to find board that does not exist', async ({ client }) => {
    const response = await login(client.get(`${url}/${100}`))
    response.assertStatus(404)
  })

  test('return 403 when trying to access a board where user is not a member', async ({
    client,
  }) => {
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })

    const response = await login(client.get(`${url}/${board.id}`))
    response.assertStatus(403)
  })

  test('user should be able to view a board when they are a member', async ({ client }) => {
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    board.related('members').attach([1])

    const response = await login(client.get(`${url}/${board.id}`))
    response.assertStatus(200)
  })

  test('should include members in response ', async ({ client, assert }) => {
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    const user = await User.find(1)
    board.related('members').attach([1])

    const response = await login(client.get(`${url}/${board.id}`))

    response.assertStatus(200)
    assert.equal(response.body().members[0].email, user?.email)
  })

  test('should include lists in response ', async ({ assert, client }) => {
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    const list = await List.create({ name: 'test-list', boardId: board.id, order: 0 })
    board.related('members').attach([1])

    const response = await login(client.get(`${url}/${board.id}`))

    response.assertStatus(200)
    assert.equal(response.body().lists[0].name, list.name)
  })
})
