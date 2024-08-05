const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require("../models/tokenModel")
const crypto = require('crypto')
const sendEmail = require("../utils/sendEmail")
require('dotenv').config()

const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET, {expiresIn:"1d"})
}

const registerUser = asyncHandler(async (req,res)=>{
    const {name,email,password} =req.body
    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all required fields")
    }
    if(password.length < 6){
        res.status(400)
        throw new Error("Password must be upto 6 characters")   
    }
    const userExists = await User.findOne({email})

    if (userExists){
        res.status(400)
        throw new Error("Email has already been registered")   
    }


    const user = await User.create({
        name,
        email,
        password
    }) 

    const token = generateToken(user._id)

    res.cookie("token", token,{
        path:"/",
        httpOnly: true,
        expires:new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        secure:true
    })

    if(user){
        const {_id,name,email,photo,phone,bio} = user
        res.status(201).json({
            _id,name,email,photo,phone,bio ,token

        })
    }
    else{
        res.status(400)
        throw new Error("Invalid user data")   
    }
    

})
const loginUser = asyncHandler(async(req,res)=>{
   const {email,password} = req.body
   if(!email || !password){
    res.status(400)
    throw new Error("Please add email and password")
   }
   const user = await User.findOne({email})
   if(!user){
    res.status(400)
    throw new Error("user not found , Please sign up")
   }

   const passwordIsCorrect = await bcrypt.compare(password, user.password)
   
   const token = generateToken(user._id)

    res.cookie("token", token,{
        path:"/",
        httpOnly: true,
        expires:new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        secure:true
    })


   if(user && password){
   
        const {_id,name,email,photo,phone,bio} = user
        res.status(200).json({
            _id,name,email,photo,phone,bio,token

        })
  
   }
   else{
    res.status(400)
    throw new Error("Invalid email or password ")
   }
})

const logout = asyncHandler(async(req,res)=>{
    res.cookie("token", "",{
        path:"/",
        httpOnly: true,
        expires:new Date(0),
        sameSite: "none",
        secure:true
    })
    return res.status(200).json({
        message: "Successfully logged out..."
    })
})

const getUser= asyncHandler(async(req,res)=>{
  const user = await User.findById(req.user._id)

  if(user){
    const {_id,name,email,photo,phone,bio} = user
    res.status(200).json({
        _id,name,email,photo,phone,bio ,token

    })
}
else{
    res.status(400)
    throw new Error("User Not Found")
}
})

const loginStatus = asyncHandler(async(req,res)=>{
    const token = req.cookies.token
    if(!token){
        return res.json(false)
    }
    const verified = jwt.verify(token,process.env.JWT_SECRET)
    if(verified){
        return res.json(false)
    }
})

const updateUser = asyncHandler(async(req,res)=>{


   const user = await User.findById(req.user._id)
   if(user){
    const {name,email,photo,phone,bio} = user
    user.email = email;
    user.name = req.body.name || name;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;

    const updatedUser = await user.save()
    res.status(200).json({
      
            _id:updatedUser._id,
            name:updatedUser.name,
            email:updatedUser.email,
            photo:updatedUser.photo,
            phone:updatedUser.phone,
            bio: updatedUser.bio

    })
   }
   else{
    res.status(404)
    throw new Error("User not found")
   }

})

const changePassword= asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    const {oldPassword,newPassword} = req.body

    if(!user){
        res.status(404)
        throw new Error("User not found,please signup")
    }
    if(!oldPassword || !password){
        res.status(404)
        throw new Error("Please add old and new Password")
    }

    const passwordIsCorrect = await bcrypt.compare(oldPassword,user.password)
    if(user && passwordIsCorrect){
        user.password = password
        await user.save()
        res.status(200).send("Password changed successfully")
    } 

    else{
        res.status(400)
        throw new Error("Old password is incorrect")
    }
})

const resetPassword= asyncHandler(async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        res.status(400)
        throw new Error("User does not exists")
    }

    let token = await Token.findOne({userId:user._id})
    if(token){
        await Token.deleteOne()
    }


    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    console.log(hashedToken)
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30*(60*1000)
    }).save()

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    const message = `
    <h2>Hello ${user.name} </h2>
    <p>Please use the url to change your password </p>
    <p>This reset link is valid for only 30  minutes </p>
    
    <a href=${resetUrl} clicktracking=off> ${resetUrl}</a>
    
    <p>Regards...</p>
    <p>Wallmart Team...</p>
    `;

    const subject = "Password Reset Request"
    const send_to = user.email
    const send_from = process.env.EMAIL_USER

    try{
        await sendEmail(subject,message,send_to,send_from)
        res.status(200).json({success:true, message:"Reset Email sent"})
    }
    catch(error){
        res.status(500)
        throw new Error("Email not sent, please try again")

    }

    
})
module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    resetPassword
}