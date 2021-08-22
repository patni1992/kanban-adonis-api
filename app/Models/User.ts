import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Route from '@ioc:Adonis/Core/Route'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import Board from './Board'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime()
  public emailVerifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Board, {
    pivotTable: 'board_members',
  })
  public boards: ManyToMany<typeof Board>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public async sendVerificationEmail() {
    const signedUrl = Route.makeSignedUrl(
      'verifyEmail',
      { email: this.email },
      { expiresIn: '30m' }
    )

    const url = `${Env.get('FRONTEND_URL')}/email-verified?path=${signedUrl}`

    Mail.send((message) => {
      message
        .from('verify@adonis-kanban.com')
        .to(this.email)
        .subject('Please verify your email')
        .htmlView('emails/verify', { user: this, url })
    })
  }
}
