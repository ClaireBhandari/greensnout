




const imgprev = document.getElementById("preview");
//const picker = document.querySelector("input ::file-selector-button");
const picker = document.getElementById("filename");

picker.addEventListener("change", function(e) {


if(!e.target.files.length) {imgprev.style.height="0vh"; imgprev.src = '';}
else {

  
 imgprev.style.height="30vh"; imgprev.src = URL.createObjectURL(e.target.files.item(0));}
  
  })