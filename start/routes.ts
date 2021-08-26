/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/hello', () => 'hello')
Route.get('/boards', 'BoardsController.index').middleware('auth')
Route.post('/boards', 'BoardsController.store').middleware('auth')
Route.delete('/boards/:id', 'BoardsController.destroy')
  .where('id', /^[0-9]+$/)
  .middleware('auth')
Route.get('/boards/:id', 'BoardsController.show')
  .where('id', /^[0-9]+$/)
  .middleware('auth')

Route.get('/lists', 'ListsController.index').middleware('auth')
Route.post('/lists/reorder', 'ListsController.reorder').middleware('auth')

Route.post('/cards/reorder', 'CardsController.reorder').middleware('auth')

Route.post('/login', 'AuthController.login')
Route.post('/register', 'AuthController.register')
Route.get('/me', 'AuthController.me').middleware('auth')
Route.get('/verify/:email', 'AuthController.verfiyEmail').as('verifyEmail')
