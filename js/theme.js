const themeBtn = document.getElementById("theme-toggle");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    themeBtn.innerHTML = document.body.classList.contains("light")
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
});
