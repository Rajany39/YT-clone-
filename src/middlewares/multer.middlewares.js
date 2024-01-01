const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })
// console.log("upload....",upload);
const uploadmiddleware = upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {   
        name : "coverImage",
        maxCount : 1
    }
])
// console.log("uploadmiddleware" , uploadmiddleware);

module.exports = uploadmiddleware