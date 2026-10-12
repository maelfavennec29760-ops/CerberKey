import express from 'express'
import { startDemo } from '../controllers/demoController.js'

const router = express.Router()

router.post('/start', startDemo)

export default router