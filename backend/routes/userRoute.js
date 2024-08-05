const express = require("express")
const { registerUser, loginUser, logout, getUser, loginStatus, updateUser, changePassword, resetPassword } = require("../controllers/userController")
const protect = require("../middleWare/authMiddleWare")
const router = express.Router()



router.post("/register", registerUser)
router.post("/login",loginUser)
router.get("/logout",logout)
router.get("/getUser",protect,getUser)
router.get("/loggedIn",loginStatus)
router.patch("/updateUser",protect, updateUser)
router.patch("/changePassword",protect,changePassword)
router.post("/resetPassword",resetPassword)

module.exports = router
