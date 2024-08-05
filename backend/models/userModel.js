const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please add a name"]

    },
    email:{
        type: String,
        required:[true,"Please add an email"],
        unique: true,
        trim: true,
        match:[
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    password:{
        type: String,
        required:[true,"Please add a Password"],
        minLength:[6,"Password must upto 6 characters"],
        //maxLength:[23,"Password must not exceed 23 characters"]
    },
   photo:{
         type: String,
        required:[true,"Please add a photo"],
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCO2sR3EtGqpIpIa-GTVnvdrDHu0WxuzpA8g&s"
   },
   phone:{
    type: String,
    default: "+91"
   },
   bio:{
    type: String,
    maxLength:[250,"Password must not exceed 250 characters"],
    default:"bio"

   }

},{
    timestamps: true
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password,salt)
    this.password = hashedPassword
    next()
})

const User = mongoose.model('User',userSchema)
module.exports = User