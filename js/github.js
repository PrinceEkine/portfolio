const githubContainer = document.getElementById("github-projects");

// Repos already shown as featured cards, plus this site itself
const featuredRepos = [
    "portfolio", "stockbit-pro", "gazneftgroup", "bitnexus2", "autobit-rescue",
    "dago", "innovaro-website-main"
];

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

fetch("https://api.github.com/users/PrinceEkine/repos?sort=pushed&per_page=100")
    .then(res => {
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
    })
    .then(data => {
        const recentRepos = data
            .filter(repo => !repo.fork && !featuredRepos.includes(repo.name.toLowerCase()))
            .slice(0, 6);

        recentRepos.forEach((repo, index) => {
            const card = document.createElement("div");
            card.className = "project-card hover-zoom";

            const updated = new Date(repo.pushed_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });

            card.innerHTML = `
                <h3>${escapeHTML(repo.name)}</h3>
                <p>${escapeHTML(repo.description || "No description available.")}</p>
                <p><strong>⭐ ${repo.stargazers_count}</strong> • ${escapeHTML(repo.language || "Code")} • Updated ${updated}</p>
                <div class="project-links">
                    <a href="${escapeHTML(repo.html_url)}" class="btn-code" target="_blank" rel="noopener">Code</a>
                </div>
            `;

            githubContainer.appendChild(card);
            if (window.observeReveal) window.observeReveal(card, index);
        });
    })
    .catch(() => {
        githubContainer.innerHTML = '<p>Unable to load GitHub projects. <a href="https://github.com/PrinceEkine" target="_blank" rel="noopener">See them on GitHub</a>.</p>';
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
