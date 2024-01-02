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
            throw new ApiError(400, "username or email is required")
            
        }
        const existedUser = await User.findOne({
            $or : [{username} ,{ email }]
        })
        if(existedUser){
            throw new ApiError(400, "Email or User already existed")
         }
        console.log(existedUser);

        const avatarLocalPath =  req.files?.avatar[0]?.path
        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar file is required")

        }

        const coverImageLocalPath =  req.files?.coverImage[0]?.path
        if(!coverImageLocalPath){
            throw new ApiError(400, "CoverImageLocalPath file is required")

        }
        
        const avatar = await uploadCloudinary(avatarLocalPath)
        if(!avatar){
            throw new ApiError(400, "Avatar image  is upload in avatar")
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
            throw new ApiError(400, "Something went wrong")

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
        console.log(loggedIsUser , "username");

        
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

const changesCurrentPassword = asyncHandler(async(req,res)=>{
    try {
        const {oldPassword , newPassword} = req.body
        const user = await User.findById(req.user._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if(!isPasswordCorrect){
            throw new ApiError(400,'Password is not right')
        }

        user.password = newPassword
       await user.save({validateBeforeSave:false})
        return res.status(200).
        json(new ApiResponse(200 , {} ,'Password Changed Successfully'))
    } catch (error) {
        return insertError("Unsuccessfull",StatusCodes.err,res)
        
    }
})


const currentUser = asyncHandler(async(req , res)=>{
    try {
        return res
        .status(200)
        .json(200 , req.user , 'current user is fetched successfully')
    } catch (error) {
        throw new ApiError(401, error?.message || "current User in not found ")
    }
})

const updateAccountDetails = asyncHandler(async(req , res)=>{
    try {
        const {fullname , email} = req.body
        const user = await User.findByIdAndUpdate(req.user._id ,
        {
            $set :{
                fullname : fullname ,
                email : email
            }
        },
        {new : true}) // wo bhi update hoga use value dikh ke aayega 

        return res.status(200).
        json(new ApiResponse((200), user , 'Update fullname or email is successfully'))
    } catch (error) {
        throw new ApiError(401, error?.message || "fullname or email is not update")
        
    }
})

const uploadCoverImage = asyncHandler(async(req , res)=>{
    try {
        const coverImageLocalPath = req.file?.path
        if(!coverImageLocalPath){
            throw new ApiError(400,'coverImageLocalPath file is missing')
        }

        const coverImage = await uploadCloudinary(coverImageLocalPath)
        if(!coverImage.url){
            throw new ApiError(400,'Error while uploading in coverImage')
        }

        const user = await User.findByIdAndUpdate(user._id ,
        {
            $set :{
                coverImage : coverImage.url
            }
        }.select("-password") ,
        {new : true})

        return res.status(200)
        .json(new ApiResponse(200 , user , 'CoverImage update is successfully'))

    } catch (error) {
        throw new ApiError(401, error?.message || "CoverImage is not update")
    }
})

const updateAvatar = asyncHandler(async(req , res)=>{
    try {
        const avatarLocalPath = req.file?.path
        if(!avatarLocalPath){
            throw new ApiError(400,'avatar file is missing')
        }

        const avatar = await uploadCloudinary(avatarLocalPath)
        if(!avatar.url){
            throw new ApiError(400,'Error while uploading in avatar')
        }

        const user = await User.findByIdAndUpdate(user._id ,
        {
            $set :{
                avatar : avatar.url
            }
        }.select("-password") ,
        {new : true})

        return res.status(200)
        .json(new ApiResponse(200 , user , 'Avatar update is successfully'))

    } catch (error) {
        throw new ApiError(401, error?.message || "Avatar is not update")
    }
})

module.exports = 
{    register ,
     loginUser , 
     logoutUser , 
     changesCurrentPassword ,
     currentUser ,
     updateAccountDetails ,
     updateAvatar ,
     uploadCoverImage
    
}