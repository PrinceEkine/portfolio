const heroSection = document.getElementById("hero");
const avatarWrap = document.getElementById("avatar-video-wrap");
const avatarVideo = document.getElementById("avatar-video");
const avatarCaption = document.getElementById("avatar-caption");

if (heroSection && avatarWrap && avatarVideo && avatarCaption) {
    // Each entry simulates a different "camera angle" on the same fixed
    // shot: how far zoomed in and which part of the frame is centered.
    const angles = {
        hero: { scale: 1.15, x: "2%", y: "-2%" },
        about: { scale: 1.55, x: "-14%", y: "-20%" },
        experience: { scale: 1.25, x: "10%", y: "6%" },
        skills: { scale: 1.65, x: "6%", y: "22%" },
        projects: { scale: 1.3, x: "-10%", y: "10%" },
        contact: { scale: 1.4, x: "0%", y: "-12%" },
    };

    const captions = {
        about: "Full-stack dev & problem solver",
        experience: "2+ years building real products",
        skills: "Java, Python, JS, React & more",
        projects: "Check out what I've built",
        contact: "Let's build something together",
    };

    function applyAngle(key) {
        const a = angles[key] || angles.hero;
        avatarVideo.style.setProperty("--cam-scale", a.scale);
        avatarVideo.style.setProperty("--cam-x", a.x);
        avatarVideo.style.setProperty("--cam-y", a.y);
    }

    function setCaption(text) {
        if (!text) {
            avatarCaption.classList.remove("show");
            return;
        }
        avatarCaption.textContent = text;
        avatarCaption.classList.add("show");
    }

    const heroObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    avatarWrap.classList.remove("docked");
                    applyAngle("hero");
                    setCaption(null);
                } else {
                    avatarWrap.classList.add("docked");
                }
            });
        },
        { threshold: 0.35 }
    );
    heroObserver.observe(heroSection);

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.target.id !== "hero") {
                    applyAngle(entry.target.id);
                    setCaption(captions[entry.target.id]);
                }
            });
        },
        { threshold: 0.5 }
    );

    document
        .querySelectorAll("section[id]")
        .forEach((section) => sectionObserver.observe(section));
}
