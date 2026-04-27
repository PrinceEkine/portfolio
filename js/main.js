
const roles = [
    "Full-Stack Developer",
    "AI Engineer",
    "Backend Specialist",
    "Problem Solver"
];

let roleIndex = 0;
let charIndex = 0;
const typewriter = document.getElementById("typewriter");

// Loading screen functionality
window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
});

// Scroll progress functionality
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scroll-progress');
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';

    // Back to top button visibility
    const backToTop = document.getElementById('back-to-top');
    if (scrollTop > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// Back to top functionality
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hamburger menu functionality
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

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
    emailjs.init("nHUgtyaDb7Xp6h7kC"); // public key
})();

document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const formStatus = document.getElementById("form-status");
    const submitBtn = this.querySelector("button");

    // Show loading state
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    formStatus.textContent = "";

    emailjs.sendForm("service_l0iwzob", "template_29m0rsl", this)
        .then(() => {
            formStatus.textContent = "Message sent successfully! 🎉";
            formStatus.style.color = "var(--gold)";
            submitBtn.textContent = "Send Message";
            submitBtn.disabled = false;

            // Add success animation
            formStatus.style.animation = "successPulse 0.6s ease";

            this.reset();
        })
        .catch((error) => {
            console.error("EmailJS error:", error);
            formStatus.textContent = "Message failed. Please try again.";
            formStatus.style.color = "#ff6b6b";
            submitBtn.textContent = "Send Message";
            submitBtn.disabled = false;
        });
});
