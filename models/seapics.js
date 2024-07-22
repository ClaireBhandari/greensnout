const mongoose = require("mongoose");
//const User = require("./models/users");
const Schema = mongoose.Schema;

/*const ImageSchema = new Schema({
  url: String,
  filename: String
}); */

const PicSchema = new Schema ({
   // title: String,
   // species: String
   title: { type: String,
required: true},
species: { type: String,
    required: true},
    //same as above, but allows validation. 
       creator : { type: Schema.Types.ObjectId,
        ref:"User"
},
     image: {
      url: String, 
      filename: String,
    },
    

    //obj id from comment model. 
    comments: [
  { type: Schema.Types.ObjectId,
    ref: "Comment" 

  }

]
  
    /*fishType : {
        type:String,
        enum: ["male", "female", "juvenile"],
        default: "female"
    },*/

});



module.exports = mongoose.model("Seapic", PicSchema);
