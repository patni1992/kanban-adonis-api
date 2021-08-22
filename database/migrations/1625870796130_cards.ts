import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Cards extends BaseSchema {
  protected tableName = 'cards'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.integer('order').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.integer('board_id').unsigned().references('boards.id').onDelete('CASCADE')
      table.integer('list_id').unsigned().notNullable().references('cards.id')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
