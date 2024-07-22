const ham = document.querySelector(".hamburger");
const burgx = document.querySelector(".hamburgx");
//const title = document.querySelector("#title");
const tog = document.querySelector(".toggle");
const dropdown = document.querySelector(".dropdown");
const dropcont = document.querySelector(".dropcont");



ham.addEventListener("click", function(e) {

  ham.style.visibility="hidden"; burgx.style.visibility="visible";
    dropdown.style.visibility="visible";  
    //dropcont.style.height="450px" 
    dropcont.style.height="100%"; 
})


burgx.addEventListener("click", function(e) {

     ham.style.visibility="visible"; burgx.style.visibility="hidden"; dropdown.style.visibility="hidden";
    dropcont.style.height="0px";   
     
 })

