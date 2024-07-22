
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema ({
  
       info: {
        type: String
       },

       author: {
        type: String
       }
    })

    module.exports = mongoose.model("Comment", CommentSchema);