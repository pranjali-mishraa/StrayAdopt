const mongoose = require("mongoose")
const { validate } = require("./user.model")

const conversationSchema  = new mongoose.Schema({

    participants:{
        type : [mongoose.Schema.Types.ObjectId],
        ref : "User",
        required : true ,
        validate : {
            validator : function (arr){
                return arr.length ===2;
            },
            message : " A conversation must have exactly 2 participants."
        },
    },

    lastMessage : {
        type : String ,
        default : ""
    },

    lastMessageAt :{
        type : Date ,
        default : Date.now
    }

},
    {timestamps:true}
)


module.exports = mongoose.model("Conversation" , conversationSchema);