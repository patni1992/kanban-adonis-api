import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import List from 'App/Models/List'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

import { BASE_URL, login } from '../utils'

test.group('BoardsController.show', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('return 401 when not authenticated', async () => {
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    await supertest(BASE_URL).get(`/boards/${board.id}`).expect(401)
  })

  test('return 404 when trying to find board that does not exist', async () => {
    const token = await login()
    await supertest(BASE_URL)
      .get(`/boards/${1000}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('return 403 when trying to access a board where user is not a member', async () => {
    const token = await login()
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    await supertest(BASE_URL)
      .get(`/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
  })

  test('user should be able to view a board where they are a member', async (assert) => {
    const token = await login()
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    board.related('members').attach([1])

    const { body } = await supertest(BASE_URL)
      .get(`/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  test('should include members in response ', async (assert) => {
    const token = await login()
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    const user = await User.find(1)
    board.related('members').attach([1])

    const { body } = await supertest(BASE_URL)
      .get(`/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.equal(body.members[0].email, user?.email)
  })

  test('should include lists in response ', async (assert) => {
    const token = await login()
    const board = await Board.create({ name: 'test-board-1', ownerId: 1 })
    const list = await List.create({ name: 'test-list', boardId: board.id, order: 0 })

    board.related('members').attach([1])

    const { body } = await supertest(BASE_URL)
      .get(`/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.equal(body.lists[0].name, list.name)
  })
})
