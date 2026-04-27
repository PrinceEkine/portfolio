const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w, h;
let mouse = { x: null, y: null };

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Mouse interaction
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
});

const orbs = [];
const orbCount = 50;

for (let i = 0; i < orbCount; i++) {
    orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 8 + 2,
        dx: (Math.random() - 0.5) * 0.6,
        dy: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.5 ? "rgba(168,85,247,0.5)" : "rgba(250,204,21,0.5)",
        originalR: Math.random() * 8 + 2
    });
}

function animate() {
    ctx.clearRect(0, 0, w, h);

    orbs.forEach(o => {
        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - o.x;
            const dy = mouse.y - o.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                o.x -= dx * force * 0.01;
                o.y -= dy * force * 0.01;
                o.r = o.originalR * (1 + force * 0.5);
            } else {
                o.r = o.originalR;
            }
        } else {
            o.r = o.originalR;
        }

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = o.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        o.x += o.dx;
        o.y += o.dy;

        // Bounce off edges
        if (o.x < 0 || o.x > w) o.dx *= -1;
        if (o.y < 0 || o.y > h) o.dy *= -1;

        // Keep particles in bounds
        o.x = Math.max(0, Math.min(w, o.x));
        o.y = Math.max(0, Math.min(h, o.y));
    });

    requestAnimationFrame(animate);
}

animate();
