const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let w, h;
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const orbs = [];
const orbCount = 40;

for (let i = 0; i < orbCount; i++) {
    orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 6 + 2,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: Math.random() > 0.5 ? "rgba(168,85,247,0.4)" : "rgba(250,204,21,0.4)"
    });
}

function animate() {
    ctx.clearRect(0, 0, w, h);

    orbs.forEach(o => {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.fill();

        o.x += o.dx;
        o.y += o.dy;

        if (o.x < 0 || o.x > w) o.dx *= -1;
        if (o.y < 0 || o.y > h) o.dy *= -1;
    });

    requestAnimationFrame(animate);
}

animate();
