import express from 'express'
import { sendDemoEmail } from '../controllers/emailController.js'

const router = express.Router()

router.post('/demo', sendDemoEmail)

export default router