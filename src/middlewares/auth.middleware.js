const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')
const User = require('../models/user.model')


const verifyJwtToken = async (req , _ , next) =>{
  try {
    const token = req.cookies.accessToken || req.header("Authorization").replace('Bearer ',"")

    if(!token){
        throw new ApiError(401 ,"UnAuthorization request")
    }

    const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(400 ,"Invalid Data")
    }

    req.user = user
    next()

  } catch (error) {
    throw new ApiError(401 , error?.message || "Invalid access Token ")
  }

}

module.exports = {verifyJwtToken}