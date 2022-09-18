import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { DateTime } from 'luxon'
import Application from '@ioc:Adonis/Core/Application'
import User from 'App/Models/User'

export default class MainSeeder extends BaseSeeder {
  public async run() {
    if (Application.environment === 'test') {
      await User.create({
        firstName: 'John',
        lastName: 'doe',
        email: 'johndoe@gmail.com',
        emailVerifiedAt: DateTime.local(),
        password: 'test123',
      })
    }
  }
}
