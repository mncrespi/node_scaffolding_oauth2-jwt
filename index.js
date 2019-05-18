import Promise from 'bluebird'
import mongoose from 'mongoose'
import config from './config/env'
import app from './config/express'
import logger from './config/winston'

// promisify mongoose
Promise.promisifyAll(mongoose)

// connect to mongo db
mongoose.connect(config.db, {
	keepAlive: true,
	useNewUrlParser: true,
	// socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
	useCreateIndex: true,
	// useFindAndModify: false,
	// autoIndex: false, // Don't build indexes
	// reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
	// reconnectInterval: 500, // Reconnect every 500ms
	// poolSize: 10, // Maintain up to 10 socket connections
	// // If not connected, return errors immediately rather than waiting for reconnect
	// bufferMaxEntries: 0,
	// connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
	// family: 4, // Use IPv4, skip trying IPv6
}).then(() => {
	logger.info('Mongoose Connect OK')
}).catch(() => {
	logger.error('Mongoose Connect ERROR')
})

mongoose.connection.on('error', () => {
	throw new Error(`unable to connect to database: ${config.db}`)
})

// listen on port config.port
app.listen(config.port, () => {
	logger.info(`server started on port ${config.port} (${config.env})`)
})

export default app
