import express from 'express'
import 'dotenv/config'
import helmet from 'helmet'
import cors from 'cors'

import healthRoutes from './routes/healthRoutes.js'
import DemoRoutes from './routes/demoRoutes.js'
import EmailRoute from './routes/emailRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
console.log('Allowed frontend:', process.env.FRONTEND_URL);
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json({ limit: '5mb' }))

app.use('/api', healthRoutes)
app.use('/api/demo', DemoRoutes)
app.use('/api/email', EmailRoute)

app.listen(PORT, () => {
    console.log(`CerberKey API running on port ${PORT}`)
})