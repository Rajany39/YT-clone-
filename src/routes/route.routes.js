const express = require('express')
const router = express()
const {register , loginUser , logoutUser} = require('../controller/user.controller')
const { verifyJwtToken } = require('../middlewares/auth.middleware')
const uploadmiddleware = require('../middlewares/multer.middlewares')

router.post('/register' ,uploadmiddleware , register)
router.post('/login' , loginUser)
router.post('/logout' , verifyJwtToken , logoutUser )

module.exports = router 