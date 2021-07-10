import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'

import { BASE_URL, login } from '../utils'

test.group('BoardsController.index', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('return 401 when not authenticated', async () => {
    await supertest(BASE_URL).get('/boards').expect(401)
  })

  test('return 200 when authenticated', async () => {
    const token = await login()
    await supertest(BASE_URL).get('/boards').set('Authorization', `Bearer ${token}`).expect(200)
  })

  test('user should only be able to view boards where they are a member', async (assert) => {
    const token = await login()
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

    const { body } = await supertest(BASE_URL)
      .get('/boards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.equal(body.length, 1)
    assert.equal(body[0].name, board1.name)
  })
})
