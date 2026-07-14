const techKeys = document.querySelectorAll(".tech-key");
const cubeLabel = document.getElementById("tech-cube-label");

if (techKeys.length && cubeLabel) {
    let autoIndex = 0;
    let lastInteraction = 0;
    let hideTimer = null;

    function activateTile(tile) {
        techKeys.forEach((k) => k.classList.remove("active"));
        tile.classList.add("active");
        cubeLabel.textContent = tile.dataset.name;
        cubeLabel.classList.add("show");

        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            tile.classList.remove("active");
            cubeLabel.classList.remove("show");
        }, 1100);
    }

    function autoCycle() {
        if (Date.now() - lastInteraction < 5000) return;
        activateTile(techKeys[autoIndex % techKeys.length]);
        autoIndex++;
    }

    setInterval(autoCycle, 2200);

    document.addEventListener("keydown", (e) => {
        const tile = document.querySelector(`.tech-key[data-key="${e.key.toLowerCase()}"]`);
        if (tile) {
            lastInteraction = Date.now();
            activateTile(tile);
        }
    });

    techKeys.forEach((tile) => {
        tile.addEventListener("click", () => {
            lastInteraction = Date.now();
            activateTile(tile);
        });
    });
}
