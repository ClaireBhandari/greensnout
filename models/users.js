
const mongoose = require("mongoose");
const passportLocalMongoose= require("passport-local-mongoose");
const Schema = mongoose.Schema;
//for passportlocalmongoose



const UserSchema = new Schema ({
   email: {
        type: String,
        required: [true, "Username must not be blank"],
        unique: true
    }
    });
    UserSchema.plugin(passportLocalMongoose);
    //adds username & passowrd field


    module.exports = mongoose.model("User", UserSchema);