import Database from '@ioc:Adonis/Lucid/Database'
import Board from 'App/Models/Board'
import List from 'App/Models/List'
import test from 'japa'
import supertest from 'supertest'

import { BASE_URL, login } from '../utils'

const url = '/lists'

test.group('ListsController.show', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('should return 401 when not authenticated', async () => {
    await supertest(BASE_URL).post(url).expect(401)
  })

  test('should return 422 when name field is missing', async (assert) => {
    const token = await login()
    const response = await supertest(BASE_URL)
      .post(url)
      .send({ boardId: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(422)

    assert.equal(
      response.body.errors.some((e) => e.field === 'name' && e.rule === 'required'),
      true
    )
  })

  test('should return 422 when boardId field is missing', async (assert) => {
    const token = await login()

    const response = await supertest(BASE_URL)
      .post(url)
      .send({ name: 'test' })
      .set('Authorization', `Bearer ${token}`)
      .expect(422)

    assert.equal(
      response.body.errors.some((e) => e.field === 'boardId' && e.rule === 'required'),
      true
    )
  })

  test('should return 404 when board with boardId not found', async () => {
    const token = await login()

    await supertest(BASE_URL)
      .post(url)
      .send({ name: 'test', boardId: 1111 })
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('should return 200 when creating a list', async (assert) => {
    const token = await login()
    const testListName = 'some-test-list'
    const seededDummyUserId = 1

    const board = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })

    await supertest(BASE_URL)
      .post(url)
      .send({ name: testListName, boardId: board.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const list = await List.findBy('name', testListName)
    assert.equal(list?.name, testListName)
  })

  test('should set order to 0 when creating a list on a board with no other lists', async (assert) => {
    const token = await login()
    const testListName = 'some-test-list'
    const seededDummyUserId = 1

    const board = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })

    await supertest(BASE_URL)
      .post(url)
      .send({ name: testListName, boardId: board.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const list = await List.findBy('name', testListName)
    assert.equal(list?.order, 0)
  })

  test('should set order to lastList.order + 1 when creating a list on a board with other lists', async (assert) => {
    const token = await login()
    const testListName = 'some-test-list'
    const seededDummyUserId = 1

    const board = await Board.create({ name: 'test-board-1', ownerId: seededDummyUserId })
    await List.create({ name: 'test-board-1', boardId: board.id, order: 0 })
    await List.create({ name: 'test-board-2', boardId: board.id, order: 1 })
    await List.create({ name: 'test-board-3', boardId: board.id, order: 2 })

    await supertest(BASE_URL)
      .post(url)
      .send({ name: testListName, boardId: board.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const list = await List.findBy('name', testListName)
    assert.equal(list?.order, 3)
  })
})
