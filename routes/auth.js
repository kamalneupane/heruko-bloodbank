const express = require('express')
const router = express.Router()
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    updatePassword,
    updateProfile,
    getAllUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    showLoginPage,
    showRegisterPage,
    showDonarDashboard,
    showAdminDashboard,
    editUser,
    forgotPasswordForm,
    resetPasswordForm,
    showChangePasswordForm,
    showUpdateProfileForm,
    getAdminProfile,
    showChangePasswordFormAdmin,
    showUpdateProfileFormAdmin,
    updateProfileAdmin
} = require('../controller/authController')
const upload = require('../middlewares/multer')
const { allDonationsDonar } = require('../controller/donationController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/login').get(showLoginPage)
router.route('/register').get(showRegisterPage)
router.route('/donar/dashboard').get(isAuthenticatedUser, authorizeRoles('user'), showDonarDashboard)
router.route('/admin/dashboard').get(isAuthenticatedUser, authorizeRoles('admin'), showAdminDashboard);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser)

router.route('/donar/search').get(isAuthenticatedUser, authorizeRoles('user'), allDonationsDonar);

router.route('/password/forgot').get(forgotPasswordForm)

router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').get(resetPasswordForm).put(resetPassword)

router.route('/donar/me').get(isAuthenticatedUser, authorizeRoles('user'), getUserProfile)
router.route('/donar/password/update').get(isAuthenticatedUser, authorizeRoles('user'), showChangePasswordForm)
router.route('/donar/password/update').put(isAuthenticatedUser, authorizeRoles('user'), updatePassword)
router.route('/donar/me/update').get(isAuthenticatedUser, authorizeRoles('user'), showUpdateProfileForm)
router.route('/donar/me/update').put(isAuthenticatedUser, authorizeRoles('user'), upload.single('avatar') ,updateProfile)


router.route('/admin/me').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProfile)
router.route('/admin/password/update').get(isAuthenticatedUser, authorizeRoles('admin'), showChangePasswordFormAdmin)
router.route('/admin/password/update').put(isAuthenticatedUser, authorizeRoles('admin'), updatePassword)
router.route('/admin/me/update').get(isAuthenticatedUser, authorizeRoles('admin'), showUpdateProfileFormAdmin)
router.route('/admin/me/update').put(isAuthenticatedUser, authorizeRoles('admin'), upload.single('avatar') ,updateProfileAdmin)

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers)
router.route('/admin/user/edit/:id').get(isAuthenticatedUser, authorizeRoles('admin'), editUser)
router.route('/admin/user/:id')
                    .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
                    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
                    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)

router.route('/logout').get(logoutUser)

module.exports = router