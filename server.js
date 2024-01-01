const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static('public'))
require('dotenv').config()
app.use(cookieParser())

const userRouter = require('./src/routes/route.routes')
app.use('/api/v1',userRouter)


mongoose.connect("mongodb+srv://yadavritik9324:yadavritik9324@cluster0.3g15ivg.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log('the database is connected');
})
.catch((err)=>{
    console.log('the database is error',err);
})

port = 4000
app.listen(port,()=>{
    console.log('server is connected');
})