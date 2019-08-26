import { Router } from 'express'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'

import authMiddleware from './app/middewares/auth'

const routes = new Router()

routes.post('/sessions', SessionController.store)

routes.post('/users', UserController.store)

routes.put('/users', authMiddleware, UserController.update)

export default routes
