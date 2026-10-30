const mongoose = require("mongoose")


const conversationSchema  = new mongoose.Schema({

    participants: [
        {
            participantId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "participants.participantModel"
            },
            participantModel: {
                type: String,
                required: true,
                enum: ["User", "Ngo"]
            }
        }
    ],

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