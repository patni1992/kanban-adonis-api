import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import List from 'App/Models/List'
import { login } from '../../utils'

const url = '/lists'

test.group('ListsController.show', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return 401 when not authenticated', async ({ client }) => {
    const response = await client.get(url)
    response.assertStatus(401)
  })

  test('should return 422 when name field is missing', async ({ client, assert }) => {
    const response = await login(client.post(url).json({ boardId: 1 }))
    response.assertStatus(422)
    assert.isTrue(response.body().errors.some((e) => e.field === 'name' && e.rule === 'required'))
  })

  test('should return 422 when boardId field is missing', async ({ client, assert }) => {
    const response = await login(client.post(url).json({ name: 'test' }))
    response.assertStatus(422)
    assert.isTrue(
      response.body().errors.some((e) => e.field === 'boardId' && e.rule === 'required')
    )
  })

  test('should return 404 when board with boardId not found', async ({ client }) => {
    const response = await login(client.post(url).json({ name: 'test', boardId: 1111 }))
    response.assertStatus(404)
  })

  test('should return 200 when creating a list', async ({ client, assert }) => {
    const testListName = 'some-test-list'
    const seededDummyUserId = 1

    const board = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })
    const response = await login(client.post(url).json({ name: testListName, boardId: board.id }))
    const list = await List.findBy('name', testListName)

    response.assertStatus(200)
    assert.equal(list?.name, testListName)
  })

  test('should set order to 0 when creating a list on a board with no other lists', async ({
    assert,
    client,
  }) => {
    const testListName = 'some-test-list'
    const seededDummyUserId = 1

    const board = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })
    const response = await login(client.post(url).json({ name: testListName, boardId: board.id }))
    const list = await List.findBy('name', testListName)

    response.assertStatus(200)
    assert.equal(list?.order, 0)
  })

  test('should set order to lastList.order + 1 when creating a list on a board with other lists', async ({
    client,
    assert,
  }) => {
    const testListName = 'some-test-list'
    const seededDummyUserId = 1

    const board = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })
    await List.create({ name: 'test-board-1', boardId: board.id, order: 0 })
    await List.create({ name: 'test-board-2', boardId: board.id, order: 1 })
    await List.create({ name: 'test-board-3', boardId: board.id, order: 2 })

    const response = await login(client.post(url).json({ name: testListName, boardId: board.id }))
    const list = await List.findBy('name', testListName)

    response.assertStatus(200)
    assert.equal(list?.order, 3)
  })
})
