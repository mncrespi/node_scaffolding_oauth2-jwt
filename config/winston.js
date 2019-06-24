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


// Code For Winston 3
// Ref: https://github.com/winstonjs/winston/blob/master/README.md
// Ref: https://github.com/winstonjs/winston/issues/1336

import { format, transports, createLogger, config, } from 'winston'

export default createLogger({
  // defaultMeta: { service: 'user-service', },
  level: 'info',
  levels: config.syslog.levels,
  format: format.combine(
    format.splat(),
    format.simple(),
    format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.json(),
    format.printf((info) => {
      return Object.keys(info).reverse().reduce((acc, key, i) => {
        if (typeof key === 'string') {
          if (i > 0) acc += ', '
          acc += `'${key}': '${info[key]}'`
        }
        return acc
      }, '{ ') + ' }'
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error', }),
    new transports.File({ filename: 'combined.log', }),
  ],
})
