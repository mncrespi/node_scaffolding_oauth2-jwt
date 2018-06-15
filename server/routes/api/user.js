import express from 'express'
import validate from 'express-validation'
import paramValidation from '../../../config/param-validation'
import userCtrl from '../../controllers/user'

const router = express.Router()  	// eslint-disable-line new-cap

router.route('/')
/** GET /api/users - Get list of users */
  .get(userCtrl.list)

  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create)

router.route('/:userId')
/** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove)


export default router
