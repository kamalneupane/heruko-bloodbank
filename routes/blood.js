const express = require('express')
const router = express.Router()

const { newBlood, getAllBloods, getSingleBlood, updateBlood, deleteBlood, showBloodForm, editblood } = require('../controller/bloodController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/admin/blood').get(isAuthenticatedUser, authorizeRoles('admin'), showBloodForm)

router.route('/blood/new').post(isAuthenticatedUser, newBlood)
router.route('/bloods').get(isAuthenticatedUser, authorizeRoles('admin'), getAllBloods)
router.route('/blood/eidt/:id').get(isAuthenticatedUser, authorizeRoles('admin'), editblood)
router.route('/blood/:id')
                    .get(getSingleBlood)
                    .put(isAuthenticatedUser, updateBlood)
                    .delete(isAuthenticatedUser, deleteBlood)
module.exports = router