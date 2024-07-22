
console.log("validations");

const butt = document.querySelector(".buttonvalid");
const title = document.querySelector("#title");




butt.addEventListener("click", function(e) {
    const input = document.querySelector("input").value;
    if(input) {alert("submitted") }

else { alert("please input title");}
})

