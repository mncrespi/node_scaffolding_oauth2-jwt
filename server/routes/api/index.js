import express from 'express'
import userRoutes from './user'
import expressJwt from 'express-jwt'
// import config from '../../../config/env'
import OAuthConfig from '../../../config/oauth'
// import authenticate from '../../controllers/oauth/authenticate'
import fs from 'fs'

const router = express.Router()  	// eslint-disable-line new-cap

const publicKey = fs.readFileSync(OAuthConfig.options.jwt.atPublicKey)

// ------------------------------------------------------
// Example oAuth2 Protected Routes: BLOCK-START
// ------------------------------------------------------
router.get('/secure', expressJwt({ secret: publicKey, }), function (req, res) {
  res.json({ message: 'Secure data', })
})

router.get('/me', expressJwt({ secret: publicKey, }), function (req, res) {
  res.json({
    me: req.user,
    messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
    description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
    more: 'pass `profile` scope while Authorize',
  })
})

router.get('/profile', expressJwt({ secret: publicKey, }), function (req, res) {
  res.json({
    profile: req.user,
  })
})
// ------------------------------------------------------
// Example oAuth2 Protected Routes: BLOCK-END
// ------------------------------------------------------

/** mount user routes at /users */
router.use('/users', expressJwt({ secret: publicKey, }), userRoutes)

/** API Index */
router.get('/', (req, res) => {
  res.json({ msg: 'node_scaffolding: Welcome to API', })
})


export default router
