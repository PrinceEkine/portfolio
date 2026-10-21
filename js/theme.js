const themeBtn = document.getElementById("theme-toggle");

function applyTheme(light) {
    document.body.classList.toggle("light", light);
    themeBtn.innerHTML = light
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

// Remember the visitor's choice between visits
let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
applyTheme(savedTheme === "light");

themeBtn.addEventListener("click", () => {
    const light = !document.body.classList.contains("light");
    applyTheme(light);
    try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
});
