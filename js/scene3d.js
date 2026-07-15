import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

// Same purple/gold brand palette used everywhere else on the site
// (--purple / --gold in css/style.css), not the muted favicon tones --
// those read as flat gray and nearly disappeared against the dark overlay.
const PALETTE = {
    purple: 0xa855f7,
    gold: 0xfacc15,
    purpleDark: 0x2e1065,
    charcoal: 0x1a1a1f,
};

const canvas = document.getElementById("scene3d-canvas");
const overlay = document.getElementById("avatar-overlay");
const caption = document.getElementById("avatar-caption");

if (canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d0f);
    scene.fog = new THREE.Fog(0x0d0d0f, 6, 14);

    const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lights: bright gold key on the camera-facing (-Z) side where the
    // character is actually visible from, purple rim from behind (+Z) for
    // an edge glow, soft purple fill near the desk.
    scene.add(new THREE.AmbientLight(PALETTE.purpleDark, 1.4));

    const keyLight = new THREE.DirectionalLight(PALETTE.gold, 3.2);
    keyLight.position.set(-2, 3.2, -2.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(PALETTE.purple, 2.2);
    rimLight.position.set(2, 2.2, 2.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(PALETTE.purple, 1.4, 10);
    fillLight.position.set(-0.5, 1.3, -1.6);
    scene.add(fillLight);

    // Untextured meshes get a vertical gradient tint in the site's actual
    // purple/gold brand colors (matching skill bars, buttons, section
    // titles), plus a matching emissive glow so the model stays clearly
    // visible against the dark overlay instead of relying purely on
    // reflected light.
    function applyGradientMaterial(object, topColor, bottomColor, emissiveIntensity) {
        object.traverse((child) => {
            if (!child.isMesh) return;
            const geom = child.geometry;
            geom.computeBoundingBox();
            const { min, max } = geom.boundingBox;
            const range = Math.max(max.y - min.y, 1e-6);
            const pos = geom.attributes.position;
            const colors = new Float32Array(pos.count * 3);
            const c1 = new THREE.Color(bottomColor);
            const c2 = new THREE.Color(topColor);
            const tmp = new THREE.Color();
            for (let i = 0; i < pos.count; i++) {
                const t = (pos.getY(i) - min.y) / range;
                tmp.copy(c1).lerp(c2, t);
                colors[i * 3] = tmp.r;
                colors[i * 3 + 1] = tmp.g;
                colors[i * 3 + 2] = tmp.b;
            }
            geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            child.material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                metalness: 0.35,
                roughness: 0.55,
                emissive: new THREE.Color(bottomColor).lerp(new THREE.Color(topColor), 0.5),
                emissiveIntensity,
            });
            child.castShadow = false;
            child.receiveShadow = false;
        });
    }

    let mixer = null;
    const clock = new THREE.Clock();

    const objLoader = new OBJLoader();
    objLoader.load("images/avatar/desk-chair.obj", (desk) => {
        applyGradientMaterial(desk, PALETTE.purple, PALETTE.purpleDark, 0.3);
        desk.position.set(0, 0, 0);
        scene.add(desk);
    });

    const fbxLoader = new FBXLoader();
    fbxLoader.load("images/avatar/typing.fbx", (character) => {
        applyGradientMaterial(character, PALETTE.gold, PALETTE.purple, 0.55);
        // Seated in the chair, facing the desk/laptop (+Z side).
        character.position.set(0, 0, 0.55);
        character.rotation.y = Math.PI;
        scene.add(character);

        if (character.animations.length) {
            mixer = new THREE.AnimationMixer(character);
            mixer.clipAction(character.animations[0]).play();
        }
    });

    // Per-section camera framing + caption, mirroring the old video
    // background's behavior but with a real moving 3D camera. All angles
    // stay on the -Z/-X side, the only side the seated character is
    // actually visible from (the tall chair back hides them otherwise).
    const angles = {
        hero: { pos: [-1.3, 1.6, -1.8], look: [0, 1.15, 0.4] },
        about: { pos: [-0.7, 1.55, -1.0], look: [0, 1.3, 0.3] },
        experience: { pos: [-2.0, 1.4, -0.8], look: [0.2, 1.1, 0.4] },
        skills: { pos: [-0.9, 1.2, -1.3], look: [0.1, 0.95, 0.35] },
        projects: { pos: [-2.2, 2.0, -2.6], look: [0, 1.15, 0.3] },
        contact: { pos: [-1.6, 1.7, -2.2], look: [0, 1.15, 0.35] },
    };
    const captions = {
        about: "Full-stack dev & problem solver",
        experience: "2+ years building real products",
        skills: "Java, Python, JS, React & more",
        projects: "Check out what I've built",
        contact: "Let's build something together",
    };

    let target = angles.hero;
    const currentPos = new THREE.Vector3(...angles.hero.pos);
    const currentLook = new THREE.Vector3(...angles.hero.look);

    function setCaption(text) {
        if (!caption) return;
        if (!text) {
            caption.classList.remove("show");
            return;
        }
        caption.textContent = text;
        caption.classList.add("show");
    }

    if ("IntersectionObserver" in window) {
        const heroSection = document.getElementById("hero");
        if (heroSection && overlay) {
            new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        overlay.classList.toggle("dimmed", !entry.isIntersecting);
                    });
                },
                { threshold: 0.35 }
            ).observe(heroSection);
        }

        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    target = angles[id] || angles.hero;
                    setCaption(id === "hero" ? null : captions[id]);
                });
            },
            { threshold: 0.5 }
        );
        document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));
    }

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        currentPos.lerp(new THREE.Vector3(...target.pos), 0.03);
        currentLook.lerp(new THREE.Vector3(...target.look), 0.03);
        camera.position.copy(currentPos);
        camera.lookAt(currentLook);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
