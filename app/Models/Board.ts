import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import List from './List'

export default class Board extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public ownerId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'board_members',
  })
  public members: ManyToMany<typeof User>

  @hasMany(() => List)
  public lists: HasMany<typeof List>

  public async getRoles() {
    const board: Board = this
    return await board.related('members').query()
  }

  public async isUserMember(user: User) {
    return this.members.find((member) => member.id === user.id)
  }
}
