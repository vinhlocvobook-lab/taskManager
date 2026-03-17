import { Router } from 'express'
import { loginHandler, registerHandler, refreshHandler, meHandler } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.post('/auth/login', loginHandler)
router.post('/auth/register', registerHandler)
router.post('/auth/refresh', refreshHandler)
router.get('/auth/me', authenticate, meHandler)

export default router