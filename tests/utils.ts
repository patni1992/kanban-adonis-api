import { ApiClient, ApiRequest } from '@japa/api-client'
import User from 'App/Models/User'
const login = async (request: ApiRequest, userId: number = 1) => {
  const user = await User.find(userId)
  return request.loginAs(user!)
}

export { login }
