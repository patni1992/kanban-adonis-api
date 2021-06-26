import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class MakeUser extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'make:user'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Make a new dummy user'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false,
  }

  public async run() {
    const { default: User } = await import('App/Models/User')

    const user = await User.create({
      firstName: 'John',
      lastName: 'doe',
      email: 'johndoe@gmail.com',
      password: 'test123',
    })
    console.log('created user')
    console.log(user.toJSON())
    return user
  }
}
