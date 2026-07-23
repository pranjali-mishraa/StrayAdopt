const multer  = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req , file , cb)=>{
    if(file.mimetype.startsWith("image/")){
        cb(null,true);
    }else{
        cb(new Error("Only images are allowed"),false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits:{
        files:5,
        fileSize:5 * 1024 * 1024,
    }
});

module.exports = upload;

