const floatingAvatar = document.getElementById("floating-avatar");
const floatingCaption = document.getElementById("floating-avatar-caption");

if (floatingAvatar && floatingCaption) {
    const DEFAULT_CAPTION = "Hi, I'm Prince \u{1F44B}";
    const captionMap = {
        about: "Full-stack dev & problem solver",
        experience: "2+ years building real products",
        skills: "Java, Python, JS, React & more",
        projects: "Check out what I've built",
        contact: "Let's build something together",
    };

    let currentCaption = DEFAULT_CAPTION;
    floatingCaption.textContent = currentCaption;
    setTimeout(() => floatingCaption.classList.add("show"), 800);

    function setCaption(text) {
        if (text === currentCaption) return;
        currentCaption = text;
        floatingCaption.classList.remove("show");
        setTimeout(() => {
            floatingCaption.textContent = text;
            floatingCaption.classList.add("show");
        }, 200);
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setCaption(captionMap[entry.target.id] || DEFAULT_CAPTION);
                }
            });
        },
        { threshold: 0.5 }
    );

    document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));

    // Smoothly follow scroll position within a safe vertical range (keeps
    // clear of the navbar up top and the chatbot/back-to-top cluster below).
    const MIN_TOP_VH = 14;
    const MAX_TOP_VH = 68;
    let currentTopVh = MIN_TOP_VH;

    function followScroll() {
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
        const targetVh = MIN_TOP_VH + progress * (MAX_TOP_VH - MIN_TOP_VH);
        currentTopVh += (targetVh - currentTopVh) * 0.06;
        floatingAvatar.style.top = `${currentTopVh}vh`;
        requestAnimationFrame(followScroll);
    }
    requestAnimationFrame(followScroll);
}
