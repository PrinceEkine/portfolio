
const roles = [
    "Full-Stack Developer",
    "AI Engineer",
    "Backend Specialist",
    "Problem Solver"
];

let roleIndex = 0;
let charIndex = 0;
const typewriter = document.getElementById("typewriter");

function typeEffect() {
    if (charIndex < roles[roleIndex].length) {
        typewriter.textContent += roles[roleIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeEffect, 80);
    } else {
        setTimeout(eraseEffect, 1500);
    }
}

function eraseEffect() {
    if (charIndex > 0) {
        typewriter.textContent = roles[roleIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseEffect, 40);
    } else {
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeEffect, 300);
    }
}

typeEffect();


const skillBars = document.querySelectorAll(".skill-fill");

function animateSkills() {
    skillBars.forEach(bar => {
        const level = bar.getAttribute("data-level");
        bar.style.width = level + "%";
    });
}

window.addEventListener("scroll", () => {
    const skillsSection = document.getElementById("skills");
    const rect = skillsSection.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100) {
        animateSkills();
    }
});



const fadeSections = document.querySelectorAll(".fade-section");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.2 });

fadeSections.forEach(section => observer.observe(section));


(function () {
    emailjs.init("nHUgtyaDb7Xp6h7kC");
})();

document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm("service_l0iwzob", "template_wqob8kc", this)
        .then(() => {
            document.getElementById("form-status").textContent = "Message sent successfully!";
        })
        .catch(() => {
            document.getElementById("form-status").textContent = "Message failed. Try again.";
        });

    this.reset();
});
