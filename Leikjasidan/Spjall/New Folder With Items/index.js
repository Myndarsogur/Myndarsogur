document.querySelector(".magic").addEventListener("click", message);

document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        message();
    }
});

function message() {
    var p1 = document.querySelector("#p1name").value;
    var p2 = document.querySelector("#p2name").value;
    var p1msg1 = document.querySelector("#p1msg1").value;
    var p2msg1 = document.querySelector("#p2msg1").value;
    var p1msg2 = document.querySelector("#p1msg2").value;
    var p2msg2 = document.querySelector("#p2msg2").value;
    var p1msg3 = document.querySelector("#p1msg3").value;
    var p2msg3 = document.querySelector("#p2msg3").value;
  
    document.querySelector("#chatbox").classList.remove("hidden");
    for (let i = 0; i < 3; i++) {
      document.querySelectorAll(".person1")[i].textContent = p1;
    document.querySelectorAll(".person2")[i].textContent = p2;
    }
    document.querySelector("#p1-1").textContent = p1msg1;
    document.querySelector("#p2-1").textContent = p2msg1;
    document.querySelector("#p1-2").textContent = p1msg2;
    document.querySelector("#p2-2").textContent = p2msg2;
    document.querySelector("#p1-3").textContent = p1msg3;
    document.querySelector("#p2-3").textContent = p2msg3;
    document.querySelector("ul").classList.add("hidden");
    document.querySelector(".maindiv").classList.add("hidden");
  }
