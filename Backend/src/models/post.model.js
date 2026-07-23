const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    postBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    images : {
        type:[String],
        required:true,
       validate:{
        validator : function(images){
            return images.length >=1 && images.length <=5;
        },
        message: "A post must contain between 1 and 5 images.",
       }
    },
    description: {
        type: String,
        required: true,
        trim: true,
      },
  
      location: {
        type: String,
        required: true,
        trim: true,
      },
      status: {
        type: String,
        enum: ["available", "adopted"],
        default: "available",
    }
},
{timestamps:true});

module.exports = mongoose.model("Post" , postSchema)