const githubContainer = document.getElementById("github-projects");

fetch("https://api.github.com/users/PrinceEkine/repos")
    .then(res => res.json())
    .then(data => {
        const topRepos = data
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);

        topRepos.forEach((repo, index) => {
            const card = document.createElement("div");
            card.className = "project-card hover-zoom";

            card.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || "No description available."}</p>
                <p><strong>⭐ ${repo.stargazers_count}</strong> • ${repo.language || "Unknown"}</p>
                <div class="project-links">
                    <a href="${repo.html_url}" target="_blank">Code</a>
                </div>
            `;

            githubContainer.appendChild(card);
            if (window.observeReveal) window.observeReveal(card, index);
        });
    })
    .catch(() => {
        githubContainer.innerHTML = "<p>Unable to load GitHub projects.</p>";
    });

const statReposEl = document.getElementById("stat-repos");
const followersEl = document.getElementById("github-followers");

fetch("https://api.github.com/users/PrinceEkine")
    .then((res) => res.json())
    .then((user) => {
        if (statReposEl && typeof user.public_repos === "number") {
            statReposEl.dataset.count = user.public_repos;
            if (window.animateStatNumber) window.animateStatNumber(statReposEl);
        }
        if (followersEl && typeof user.followers === "number") {
            followersEl.textContent = `${user.followers.toLocaleString()} followers`;
        }
    })
    .catch(() => {
        // Showing a wrong/zero count is worse than not showing the card.
        if (statReposEl) {
            const card = statReposEl.closest(".stat-card");
            if (card) card.style.display = "none";
        }
        if (followersEl) followersEl.textContent = "";
    });
