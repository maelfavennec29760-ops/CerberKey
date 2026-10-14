import express from 'express'
import { startDemo } from '../controllers/demoController.js'
import { verifyDemo } from '../controllers/verifyDemoController.js'
import { sendFeedback } from '../controllers/feedbackController.js'

const router = express.Router()

router.post('/start', startDemo)
router.post('/verify', verifyDemo)
router.post('/feedback', sendFeedback)

export default router