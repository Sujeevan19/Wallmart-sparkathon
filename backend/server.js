require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const port = process.env.PORT || 5000;
const userRoute = require("./routes/userRoute")
const errorHandler = require('./middleWare/errorMiddleWare')
const cookieParser = require('cookie-parser')

console.log('Mongo URL:', process.env.MONGO_URL); // Debug statement



app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use("/api/users",userRoute)

app.get('/', (req, res) => {
    res.send("<h1>HELLO</h1>");
});

app.use(errorHandler)


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Database connected ...');
}).catch(err => {
    console.error('Database connection error:', err);
});

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});
