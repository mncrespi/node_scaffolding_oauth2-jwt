export default {
  env: 'production',
  db: 'mongodb://localhost/node_scaffolding_oauth-jwt',
  port: 3000,
  logger: {
    level: 'debug',
    prettyPrint: true,
    logFile: '/var/log/node_scaffolding.log',
  },
  jwt: {
    secret: 'shhhhhhhh',
    expire: 3600, //in Seconds ( 1Hs )
  },
  cookieParser: {
    secret: 'shhhhhhhh',
  },
}
