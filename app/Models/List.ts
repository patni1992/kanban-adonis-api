import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, hasMany, HasMany, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Board from './Board'
import Card from './Card'

export default class List extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public order: number

  @column()
  public boardId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Board)
  public board: BelongsTo<typeof Board>

  @hasMany(() => Card)
  public cards: HasMany<typeof Card>
}
