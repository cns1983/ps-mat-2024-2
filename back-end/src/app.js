import express, { json, urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import indexRouter from './routes/index.js'
import usersRouter from './routes/users.js'

import carsRouter from './routes/cars.js'
import customerRouter from './routes/customer.js'

const app = express()

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/users', usersRouter)

/************ ROTAS DA API ********************** */
app.use('/cars', carsRouter)
app.use('/customer', customerRouter)

export default app
