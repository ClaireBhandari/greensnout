/*module.exports = [
    {}
]
this file can be run when seeding database.
*/

//const express = require ("express");
//const path = require("path");
const mongoose = require("mongoose");
const creatures = require("./creatures")
const Seapic = require("../models/seapics")

mongoose.connect("mongodb://localhost:27017/seapics"

)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const seedDB = async() => {
    await Seapic.deleteMany({});
    //deletes all entries first. 

    //const p = new Seapic({title: "seedtest"});
    //await p.save();
    for (let i=0; i<3; i++) {
        const rand = Math.floor(Math.random() * 3);
    
    const entry = new Seapic({
      species: `${creatures[rand].species}`,
      title: `${creatures[rand].title}`,
      //creates 3 random entries from creatures.js
    })
    await entry.save();
  }
}

seedDB().then(() => {
    mongoose.connection.close();
})