const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
// const localVariables  = require("../middleware/authenticate")
// const authenticate = require("../middleware/authenticate")

router.get('/profile', userController.getUserProfile)
router.get('/', userController.getAllUsers)
router.get('/user/:userId', userController.getUserById);
router.get('/generateOTP', userController.verifyUser, userController.generateOTP)
router.get('/verifyOTP',  userController.verifyUser,   userController.verifyOTP)
router.get('/createResetSession',  userController.createResetSession)
router.put('/resetPassword', userController.verifyUser,  userController.resetPassword)


module.exports = router