if(process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

//for production or git, omit or ignore .env file
// console.log(process.env.KEYNAME) for KEYNAME=VALUENAME in .env file

const express = require ("express");
const path = require("path");
const mongoose = require("mongoose");
const Joi = require("joi");
const methodOverride = require("method-override");
//added passport for auth
const passport = require("passport");
const passportlocal = require("passport-local");

const multer = require("multer");

//added logic for checking file types

const fileFilter = (req, file, cb) => {
  // Reject files with a mimetype other than 'image/png' or 'image/jpeg'
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Only PNG and JPEG files are allowed"), false);
  }
};

const {storage} = require("./cloudinary");
//storage object in cloudinary folder. 
const upload = multer({storage, fileFilter, limits: { fileSize: 1024 * 1024 * 3 } });
//set 3mb limit

//const upload = multer({ dest: "uploads/"})

const Seapic = require("./models/seapics");
const User = require("./models/users");
const Comment = require("./models/comments");
const session = require("express-session");
//cookie stored, inspect -> application -> cookies
const flash = require("connect-flash");
//configure app to store session with mongo
//const MongoStore = require("connect-mongo") (session);
//deprecated
const MongoStore = require("connect-mongo"); 
//cloud db connection 

const dbUrl =  "mongodb://localhost:27017/seapics";
//local db connection with users etc. 
//mongoose.connect("mongodb://localhost:27017/seapics"
mongoose.connect(dbUrl
   // , {useNewUrlParser: true,
    //useCreateIndex: true,
    //useUnifiedTopology: true }
    //unnecessary and deprecated so commented out.
)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

//const bcrypt = require("bcrypt");
const seapics = require("./models/seapics");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
express.static("statics");
app.use(express.static("statics"));


app.use(express.urlencoded({extended: true}))
//to parse req.body from app.post 

//const store = new MongoStore ({
 // url: dbUrl,
 const store = MongoStore.create ({
   mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
 //add secret key here
  }
  

  //after 24 hours
  //to avoid unnecessary resaves when refreshing etc. if data has not changed
});

store.on("error", function(err) {
  console.log("mongo session storage error", err)
})
//app.use(session({ 
//const sessionConfig = {
  const sessionConfig = app.use(session({ 
  store,
 //add secret key here,
  resave: true,
  saveUninitialized: true
}));
//secret key to prevent session hijacking?

app.use(session(sessionConfig));
//store session info in local memory etc. 

app.use(flash());
//adds flash method object to requests. 

app.use(passport.initialize());
//passport.session middleware for persistent login
app.use(passport.session());
passport.use(new passportlocal(User.authenticate()));
//uses authenticate method from passport for user model

passport.serializeUser(User.serializeUser());
//stores user in session
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=> {
  res.locals.currentUser = req.user;
  //undefined if noone is signed in
res.locals.info = req.flash("info");
res.locals.error = req.flash("error");
next();
})

app.use(methodOverride("_method"));

//middleware 

const reqlogin = (req, res, next) => {
    if(!req.isAuthenticated()){
      req.flash("info", "You must be signed in first");
  return res.redirect("/")
    }
    next();
  }

app.get("/register", (req, res) => {
  res.render("register");
})

    app.post("/register", async(req, res) => {
     try {
      const {email, username, password} = req.body;
    const newuser = new User({email, username});
   const registereduser = await User.register(newuser, password);
   //for logging in straight after registering. add next in top.
   req.flash("info", "You have successfully registered");
   res.redirect("/");
  }
   catch (err) {
    if(!req.body.email) {req.flash("info", "No email address given");
     return res.redirect("/register");
    }
    req.flash("info", err.message);
    res.redirect("/register");
   }

})
   //await bcrypt.hash(req.body)
        //instead you could use mongoose to hash password. can add middleware to the model.
//middleware for editing/deleting permissions.
const isCreator = async(req, res, next) => {
  const {id} = req.params;
  const seapics = await Seapic.findById(id);
  if(!seapics) {
   req.flash("info", "Photo not found");
   return res.redirect("/pictures");}
  if(!seapics.creator.equals(req.user._id)) {
  req.flash("info", "Please log in");
   return res.redirect(`/pictures/${seapics._id}`);
  }
  next();
}

const timer = (req,res,next) => {
setTimeout (() => {console.log("time up!")}, 15000);
  next();
}
   

app.get('/', (req, res) => {
res.render("home");
})

//app.post('/', passport.authenticate("local", {failureFlash: true, failureRedirect: '/'}), async (req, res) => {
  app.post('/', passport.authenticate("local", {failureRedirect: '/'}),  async (req, res) => {
  //for login form
  //"local" for username, pw. Can use different route for google,
  //twitter login etc. 
req.flash("info", "Login successful");
res.redirect("/pictures");
})

app.post("/logout", (req, res, next) => {
  req.logout(function (err) {
      if (err) {
          return next(err);
      }
      req.flash("info", "You have successfully logged out");
      res.redirect('/');
  });
}); 

        app.get("/pictures", async (req, res) => {
          //page to display all pictures as thumbnails.
           const seapics = await Seapic.find({}).populate("creator");
           //use populate to take values from User & put in Seapics.
           res.render("list2", {seapics})
           //res.locals.currentUser = req.user;
           
            })
            /*app.get("/pictures/new2", reqlogin, (req,res) => {
              //this route needs to come BEFORE pictures:id*/

         app.get("/pictures/new2",  (req,res) => {
       if(!req.isAuthenticated()){
        req.flash("info", "You must be signed in to upload photos");
        return res.redirect('/');
        //return otherwise below render still works.headers cant be set after they are sent error.
       }
          res.render("new2"); 
         })

         //multer to parse multipart form data
         // app.post("/pictures", reqlogin, upload.single("seapics[image]"), async(req, res, next) => {
            app.post("/pictures", reqlogin, upload.single("seapics[image]"), async(req, res) => {
          //to send & save data for adding new picture. errors caught by app.use at end.
           
            //joi validations
            const seapicSchema = Joi.object({
              //NOT a mongoose schema; will validate before saved in mongoose.
            seapics: Joi.object({
              title: Joi.string().required(),
              species: Joi.string().required(),
             }).required()
            })
             const {error} = seapicSchema.validate(req.body);

              if(error || !req.file) {
             req.flash("info", "Please fill out all fields");
             res.redirect("/pictures/new2");
           }
         
else {
 const seapics = new Seapic(req.body.seapics);
 seapics.image = {url: req.file.path, filename: req.file.filename};
 //req.body contains text, req.file contains file. 
seapics.creator = res.locals.currentUser._id;
   await seapics.save();
  res.redirect(`/pictures/${seapics._id}`)

}

         })

        app.get("/pictures/:id", async(req, res, next) => {
          try{
         // const seapics = await Seapic.findById(req.params.id);
         const ids = (req.params.id.toString());
          const seapics = await Seapic.findOne({"_id": ids}).populate("comments").populate("creator");
          if(!seapics) {
            req.flash("info", "Photo not found");
          return res.redirect("/pictures")}
          res.render("show", {seapics});
          } catch(e){
            next(e);
          }
        })
  
        app.get("/pictures/:id/edit", reqlogin, isCreator,  async(req, res) => {
          //to edit existing photos. make sure to install method override to 
          //enable put/patch requests. 
           const {id} = req.params;
           const seapics = await Seapic.findById(id);
          if(!seapics) {
            req.flash("info", "Photo not found");
          return res.redirect("/pictures");}
           
         res.render("edit", {seapics});
        })

        app.put("/pictures/:id", reqlogin, isCreator, async (req, res) => {
          //?_method=PUT" in form action goes into query string.
          //send edited photos here
          const {id} = req.params;
        const seapic = await Seapic.findByIdAndUpdate(id, { ...req.body.seapics}); 
          req.flash("info", "Successfully edited photo");
         res.redirect("/pictures") 
        })

        app.get("/pictures/:id/delete", reqlogin, isCreator, async (req, res) => {
            const {id} = req.params;
          const seapics = await Seapic.findById(req.params.id);
          if(!seapics) {
            req.flash("info", "Photo not there");
          return res.redirect("/pictures");}
           
          await Seapic.deleteOne({_id : req.params.id })
          res.redirect("/pictures")

          
        })
   
        app.post("/pictures/:id/comments", reqlogin, async(req, res, next) => {
          const ids = (req.params.id.toString());
          const seapics = await Seapic.findOne({"_id": ids});
          const comment = new Comment ({
            info: req.body.comments
            //instead you could use mongoose to hash password. can add middleware to the model.
          })
          seapics.comments.push(comment);

         comment.author = res.locals.currentUser.username;
          await comment.save();
          await seapics.save();
         res.redirect(`/pictures/${seapics._id}`) 
        })
        
        app.get("/pictures/:id/comments/:comid/remove", reqlogin, async(req, res) => {
          //test route for deleting comments.
          //use mongo $pull operator to remove values from array
          const {id, comid} = req.params;
          const comment = await Comment.findById(comid);
          if(!comment) {
            req.flash("info", "Comment not found");
            return res.redirect("/pictures");
          }

            if(comment.author == (req.user.username)) {
            //   req.user_id.
            await Comment.deleteOne({_id : comid });
            await Seapic.findByIdAndUpdate(id, {$pull: {comments: comid}});
            //or req.params.id
             return res.redirect("/pictures");

            }

          req.flash("info", "Please login");
          res.redirect("/pictures");
        })

        //added to show mongo error types. 
        app.use((err,req,res,next) => {
          console.log(err.name);
          next(err);
        })

        app.use((err, req, res, next) => {
          //catches errors from post request- handled by express
          res.render("errors")
          
        })

        app.get('*', function(req, res){
          res.status(404).send("404 not found");
        });

app.listen(3000, () => {
    console.log("hello")
})
