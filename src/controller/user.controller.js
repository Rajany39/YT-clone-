const {success,error,insertSuccess,insertError} = require('../utils/response-handler')
const StatusCodes = require('http-status-codes')
const User = require('../models/user.model')
const CustomAPIError = require('../errors')
const {uploadCloudinary} = require('../utils/cloudinary')
const {asyncHandler} = require('../utils/asyncHandler')
const {ApiError} = require('../utils/ApiError')
const {ApiResponse} = require('../utils/ApiResponse')

const generateAccessandRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({validateBeforeSave : false})
        return {accessToken , refreshToken}
    } catch (error) {
        return insertError(500 ,"Something Error in refresh Token",res)
    }

    
}


const register = async (req , res ) =>{
    try {
        let reqbody = req.body
        let {fullname , email ,username , password } = reqbody
        if ([fullname, email, username, password].some((fields) => fields?.trim() === "")) {
            
            throw new CustomAPIError.BadRequestError(
                "bad request",
                StatusCodes.
                BAD_REQUEST
            );
        }
        const existedUser = await User.findOne({
            $or : [{username} ,{ email }]
        })
        if(existedUser){
             return insertError("Email or User already existed", StatusCodes.err, res);
        }
        console.log(existedUser);
        const avatarLocalPath =  req.files?.avatar[0]?.path
        if(!avatarLocalPath){
             return insertError("Avatar file is required", StatusCodes.err, res);
        }

        const coverImageLocalPath =  req.files?.coverImage[0]?.path
        if(!coverImageLocalPath){
             return insertError("CoverImageLocalPath file is required", StatusCodes.err, res);
        }
        
        const avatar = await uploadCloudinary(avatarLocalPath)
        if(!avatar){
             return insertError("Avatar image  is upload in avatar", StatusCodes.err, res);
        }
        const coverImage = await uploadCloudinary(coverImageLocalPath)
        const user = await User.create({
            fullname ,
            avatar : avatar.url ,
            coverImage  : coverImage?.url || "",
            email,
            username :username.toLowerCase() ,
            password

        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            return insertError("Something went wrong", 500 , res);
        }
        return insertSuccess("successfull",200,res)
        
        
    } catch (err) {
        return insertError("Unsuccessfull",StatusCodes.err,res)
    }
}

const loginUser = async (req, res) => {
    try {
        let reqbody = req.body
        let {username ,email , password } = reqbody
        if(!username || !email){
            throw new ApiError(400, "username or email is required")
        }
        console.log(username , "username");
        
        const user = await User.findOne({
            $or : [{username , email}]
        })
        console.log( user , "username");


        if (!user) {
            throw new ApiError(404, "User does not exist")
        }

        const isPasswordValid =  await user.isPasswordCorrect(password)

        if(! isPasswordValid){
            throw new ApiError(404, "Invalid user Credentials")
        }
        console.log(isPasswordValid , "isPasswordValid");

        
        const {accessToken , refreshToken} = await generateAccessandRefreshToken(user._id)
        console.log(accessToken ,refreshToken , "refreshToken");


        const loggedIsUser = await User.findById(user._id).select(-password -refreshToken)
        console.log(username , "username");

        
        // cookie is by default modifed any one in fronted when you can use httponly & secure 
        // so u can only modifed from server
        const options = {
            httpOnly : true ,
            secure : true
        }

        return res.status(200)
        .cookie('accessToken' , accessToken , options)
        .cookie('refreshToken' , refreshToken , options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken},
                "Access token refreshed"
            ))
    

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
}}

const logoutUser = async (req , res) =>{
   try {
    await User.findByIdAndUpdate(req.user._id ,
        {
            $set :
            {
                refreshToken : undefined
            }
        },
            {
                new : true // update token milega apne ko 
            }
    )
    const options = {
        httpOnly : true ,
        secure : true
    }
   return res.status(200)
        .cookie('accessToken' ,  options)
        .cookie('refreshToken' ,options)
        .json(new ApiResponse(200) , {} , "User logout ")
}
    catch (err) {
    return insertError("Unsuccessfull",StatusCodes.err,res)
    }
}


module.exports = {register , loginUser , logoutUser}