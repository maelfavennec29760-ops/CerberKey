import express from 'express'
import { startDemo } from '../controllers/demoController.js'
import { verifyDemo } from '../controllers/verifyDemoController.js'

const router = express.Router()

router.post('/start', startDemo)
router.post('/verify', verifyDemo)

export default router