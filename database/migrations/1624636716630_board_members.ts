import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BoardMembers extends BaseSchema {
  protected tableName = 'board_members'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('board_id').references('boards.id').onDelete('CASCADE')
      table.integer('user_id').references('users.id').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
