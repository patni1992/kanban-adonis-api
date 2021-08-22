import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
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

  test('should return 401 when not authenticated', async () => {
    await supertest(BASE_URL).post('/boards').expect(401)
  })

  test('should return 422 when name field is missing', async (assert) => {
    const token = await login()
    const boards = await Board.all()
    await supertest(BASE_URL).post('/boards').set('Authorization', `Bearer ${token}`).expect(422)

    assert.equal(boards.length, 0)
  })

  test('should return 200 when creating a board', async (assert) => {
    const token = await login()
    const testBoardName = 'some-test-board'

    await supertest(BASE_URL)
      .post('/boards')
      .send({ name: testBoardName })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const board = await Board.findBy('name', testBoardName)
    assert.equal(board?.name, testBoardName)
  })

  test('should set user as owner when creating a board', async (assert) => {
    const token = await login()
    const testBoardName = 'some-test-board'

    await supertest(BASE_URL)
      .post('/boards')
      .send({ name: testBoardName })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const board = await Board.findBy('name', testBoardName)
    await board?.load('owner')
    assert.equal(board?.owner.email, 'johndoe@gmail.com')
  })

  test('should add user as a board member when creating a board', async (assert) => {
    const token = await login()
    const testBoardName = 'some-test-board'

    await supertest(BASE_URL)
      .post('/boards')
      .send({ name: testBoardName })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const board = await Board.findBy('name', testBoardName)
    await board?.load('members')
    assert.equal(board?.members[0].email, 'johndoe@gmail.com')
  })
})
