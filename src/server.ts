import dotenv from 'dotenv'
import express from 'express'
import { db } from './config/db'
import { corsConfig } from './config/cors'
import authRoutes from './routes/authRoutes'
import proyectoRoutes from './routes/proyectoRoutes'
import cors from 'cors'

dotenv.config()

db()

const app = express()

app.use(express.json())
app.use(cors(corsConfig))

app.use('/api/auth', authRoutes)
app.use('/api/proyectos', proyectoRoutes)

export default app