import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import { test } from '@japa/runner'
import { login } from '../../utils'

const url = '/boards'

test.group('BoardsController.store', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should return 401 when not authenticated', async ({ client }) => {
    const response = await client.post(url)
    response.assertStatus(401)
  })

  test('should return 422 when name field is missing', async ({ assert, client }) => {
    const response = await login(client.post(url))
    const boards = await Board.all()

    response.assertStatus(422)
    assert.equal(boards.length, 0)
    assert.isTrue(response.body().errors.some((e) => e.field === 'name' && e.rule === 'required'))
  })

  test('should return 200 when creating a board', async ({ client, assert }) => {
    const testBoardName = 'some-test-board'

    const response = await login(client.post(url).json({ name: testBoardName }))
    const board = await Board.findBy('name', testBoardName)

    response.assertStatus(200)
    assert.equal(board?.name, testBoardName)
  })

  test('should set user as owner when creating a board', async ({ client, assert }) => {
    const testBoardName = 'some-test-board'

    const response = await login(client.post(url).json({ name: testBoardName }))

    const board = await Board.findBy('name', testBoardName)
    await board?.load('owner')

    response.assertStatus(200)
    assert.equal(board?.owner.email, 'johndoe@gmail.com')
  })

  test('should add user as a board member when creating a board', async ({ assert, client }) => {
    const testBoardName = 'some-test-board'

    const response = await login(client.post(url).json({ name: testBoardName }))

    const board = await Board.findBy('name', testBoardName)
    await board?.load('members')

    response.assertStatus(200)
    assert.equal(board?.members[0].email, 'johndoe@gmail.com')
  })
})
