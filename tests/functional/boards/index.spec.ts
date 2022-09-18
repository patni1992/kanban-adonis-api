import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import User from 'App/Models/User'
import { test } from '@japa/runner'
import { login } from '../../utils'

const url = '/boards'

test.group('BoardsController.index', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('return 401 when not authenticated', async ({ client }) => {
    const response = await client.get(url)
    response.assertStatus(401)
  })

  test('return 200 when authenticated', async ({ client }) => {
    const response = await login(client.get(url))
    response.assertStatus(200)
  })

  test('user should only be able to view boards where they are a member', async ({
    client,
    assert,
  }) => {
    const seededDummyUserId = 1
    const secondUser = await User.create({
      email: 'testuser@example.com',
      firstName: 'test',
      lastName: 'user',
      password: 'test123',
    })

    const board1 = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })
    const board2 = await Board.create({ name: 'test-board-2', ownerId: secondUser.id })
    board1.related('members').attach([seededDummyUserId])
    board2.related('members').attach([secondUser.id])

    const response = await login(client.get(url))

    response.assertStatus(200)
    assert.equal(response.body().length, 1)
    assert.equal(response.body()[0].name, board1.name)
  })
})
