document.getElementById("skillForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let skill = document.getElementById("skill").value;

    let list = document.getElementById("skillList");

    let li = document.createElement("li");
    li.textContent = name + " teaches " + skill;

    list.appendChild(li);

    document.getElementById("skillForm").reset();
});
