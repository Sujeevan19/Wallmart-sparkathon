const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require("express-async-handler")
const User = require('../models/userModel')

const protect = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.token
    if(!token){
        res.status(401)
        throw new Error("Not authorized,Please login")
    }

    const verified = jwt.verify(token,process.env.JWT_SECRET)
    const user = await User.findById(verified.id).select("-password")
    if(!user){
        res.status(401)
        throw new Error("User not found...")
    }

    req.user = user
    next()
})
module.exports = protect