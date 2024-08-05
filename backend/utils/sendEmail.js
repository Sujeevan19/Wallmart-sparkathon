const nodemailer = require('nodemailer')
const { options } = require('../routes/userRoute')
const sendEmail = async(subject,message, send_to,send_from)=>{
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port: 587,
        auth:{
            user:process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls:{
            rejectUnauthorized:false
        }
    })

    const options ={
        from:send_from,
        to:send_to,

        subject: subject,
        html: message, 
    }

transporter.sendMail(options,function(err,info) {
    if(err){
        console.log(err)

    }
    else{
        console.log(info)
    }

})

}
module.exports = sendEmail