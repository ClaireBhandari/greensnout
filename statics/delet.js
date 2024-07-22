const delet = document.querySelector("#delet");


delet.addEventListener("click", function(e) {
let txt = "Are you sure you want to delete this?";
if (confirm(txt) == true) {
  const loc = window.location;
  const locs = loc.toString() + "/delete";
  window.location.href = locs;


} else {
 
}
   

})



