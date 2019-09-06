import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'

import authMiddleware from './app/middewares/auth'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/sessions', SessionController.store)

routes.post('/users', UserController.store)

routes.use(authMiddleware)

routes.put('/users', UserController.update)

routes.post('/files', upload.single('file'), async (req, res) => {
  return res.json({ message: 'ok' })
})

export default routes
