import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Board from 'App/Models/Board'

export default class BoardSeeder extends BaseSeeder {
  public async run() {
    await Board.createMany([{ name: 'My first board' }, { name: 'Test' }, { name: 'Hello world' }])
  }
}
