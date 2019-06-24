import APIError from '../server/helpers/APIError'
import bodyParser from 'body-parser'
import compress from 'compression'
import config from './env'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import expressValidation from 'express-validation'
import expressWinston from 'express-winston'
import helmet from 'helmet'
import httpStatus from 'http-status'
import logger from 'morgan'
import methodOverride from 'method-override'
import routes from '../server/routes'
import winstonInstance from './winston'
import oAuthComponents        from '../server/controllers/oauth'

import winston from 'winston'

const app = express()

if (config.env === 'development') {
  app.use(logger('dev'))
}

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, }))

app.use(cookieParser(config.cookieParser.secret))
app.use(compress())
app.use(methodOverride())

// secure apps by setting various HTTP headers
app.use(helmet())

// disable 'X-Powered-By' header in response
app.disable('x-powered-by')

// enable CORS - Cross Origin Resource Sharing
app.use(cors())

// enable detailed API logging in dev env
if (config.env === 'development') {
  // expressWinston.requestWhitelist.push('body')
  // expressWinston.responseWhitelist.push('body')
  // app.use(expressWinston.logger({
  //   winstonInstance,
  //   meta: true,   // optional: log meta data about request (defaults to true)
  //   msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  //   colorStatus: true,   // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  // }))


  // New Example
  // const winstonOptions = {
  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.timestamp(),
  //     winston.format.align(),
  //     winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  //   ),

  //   transports: [
  //     new winston.transports.Console(),
  //   ],
  // }

  const expressWinstonOptions = {
    meta: false,
    msg: '{{req.ip}} {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorize: true,
  }

  // HACK: Remove when `express-winston` fixes this
  // HACK: See https://github.com/bithavoc/express-winston/issues/163
  // expressWinstonOptions.winstonInstance = winston.createLogger(winstonOptions)
  expressWinstonOptions.winstonInstance = winstonInstance
  app.use(expressWinston.logger(expressWinstonOptions))
}

// mount all routes on /api path
app.use('/', routes)

// mount oAuthComponents
oAuthComponents(app)

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map((error) => error.messages.join('. ')).join(' and ')
    const error = APIError(err.status, unifiedErrorMessage, true)
    return next(error)
  } else if (!(err instanceof APIError)) {
    const apiError = APIError(err.status, err.message, err.isPublic)
    return next(apiError)
  }
  return next(err)
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = APIError(httpStatus.NOT_FOUND)
  return next(err)
})

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance,
  }))
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {},
  })
})

export default app
