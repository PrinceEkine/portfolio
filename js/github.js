const githubContainer = document.getElementById("github-projects");

fetch("https://api.github.com/users/PrinceEkine/repos")
    .then(res => res.json())
    .then(data => {
        const topRepos = data
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);

        topRepos.forEach(repo => {
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
        });
    })
    .catch(() => {
        githubContainer.innerHTML = "<p>Unable to load GitHub projects.</p>";
    });
