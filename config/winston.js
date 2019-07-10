import winston from 'winston'
import config from './env'

// TODO: WIP...
const options = {
  file: {
    level: config.logger.level,
    filename: config.logger.logFile,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: winston.format.printf(({ timestamp, level, message, }) => {
      return `${timestamp} ${level} message: ${message}`
    }),
  },
  console: {
    level: config.logger.level,
    handleExceptions: true,
    json: false,
    colorize: true,
    format: winston.format.printf(({ timestamp, level, message, }) => {
      return `${timestamp} ${level} message: ${message}`
    }),
  },
}

const logger = new winston.createLogger({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple(),
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      winston.format.json()
  ),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
})

logger.stream = {
  write: (message, encoding) => {
    logger.info(message)
  },
}

export default logger

// Example Code For Winston 2
// import winston from 'winston'
// import config from './env'

// export default new winston.Logger({
//   level: config.logger.level,
//   levels: winston.config.syslog.levels,
//   transports: [
//     new (winston.transports.Console)({
//       colorize: true,
//       timestamp: true,
//       prettyPrint: config.logger.prettyPrint,
//     }),
//     new (winston.transports.File)({
//       filename: config.logger.logFile,
//     }),
//   ],
// })


// Example Code For Winston 3
// Ref: https://github.com/winstonjs/winston/blob/master/README.md
// Ref: https://github.com/winstonjs/winston/issues/1336

// import { format, transports, createLogger, config, } from 'winston'

// export default createLogger({
//   // defaultMeta: { service: 'user-service', },
//   level: 'info',
//   levels: config.syslog.levels,
//   format: format.combine(
//     format.splat(),
//     format.simple(),
//     format.colorize(),
//     format.timestamp(),
//     format.prettyPrint(),
//     format.json(),
//     format.printf((info) => {
//       return Object.keys(info).reverse().reduce((acc, key, i) => {
//         if (typeof key === 'string') {
//           if (i > 0) acc += ', '
//           acc += `'${key}': '${info[key]}'`
//         }
//         return acc
//       }, '{ ') + ' }'
//     })
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: 'error.log', level: 'error', }),
//     new transports.File({ filename: 'combined.log', }),
//   ],
// })
