import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

import { BASE_URL, login } from '../utils'

const boardName = 'test-board-test'

test.group('BoardsController.show', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('should return 401 when not authenticated', async (assert) => {
    const board = await Board.create({ name: boardName, ownerId: 1 })

    await supertest(BASE_URL).delete(`/boards/${board.id}`).expect(401)

    const notDeletedBoard = await Board.find(board.id)
    assert.equal(board.id, notDeletedBoard?.id)
  })

  test('should return 403 forbidden when user is not owner', async (assert) => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@email.com',
      password: '1234',
    })

    const board = await Board.create({ name: boardName, ownerId: user.id })
    const token = await login()

    await supertest(BASE_URL)
      .delete(`/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    const notDeletedBoard = await Board.find(board.id)
    assert.equal(board.id, notDeletedBoard?.id)
  })

  test('should delete board when user is owner', async (assert) => {
    const board = await Board.create({ name: boardName, ownerId: 1 })
    const token = await login()

    await supertest(BASE_URL)
      .delete(`/boards/${board.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const deletedBoard = await Board.find(board.id)
    assert.equal(deletedBoard, null)
  })
})
