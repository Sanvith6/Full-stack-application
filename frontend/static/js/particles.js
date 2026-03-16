/* ============================================
   VANGUARD PROTOCOL — Particle System
   Interactive canvas-based particle effects
   ============================================ */

(function () {
    "use strict";

    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let animFrameId;

    const CONFIG = {
        count: 80,
        maxSize: 2.5,
        minSize: 0.5,
        speed: 0.3,
        connectionDist: 150,
        mouseRadius: 200,
        mouseForce: 0.02,
        colors: ["#ff4655", "#00d4aa", "#ece8e1"],
        lineOpacity: 0.12,
    };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticle() {
        const color =
            CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * CONFIG.speed,
            vy: (Math.random() - 0.5) * CONFIG.speed,
            size:
                CONFIG.minSize +
                Math.random() * (CONFIG.maxSize - CONFIG.minSize),
            color: color,
            alpha: 0.3 + Math.random() * 0.5,
        };
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push(createParticle());
        }
    }

    function drawParticle(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.connectionDist) {
                    const opacity =
                        CONFIG.lineOpacity *
                        (1 - dist / CONFIG.connectionDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 70, 85, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function update() {
        particles.forEach(function (p) {
            // Mouse repulsion
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONFIG.mouseRadius && dist > 0) {
                const force =
                    (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                p.vx += (dx / dist) * force * CONFIG.mouseForce;
                p.vy += (dy / dist) * force * CONFIG.mouseForce;
            }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        update();
        drawConnections();
        particles.forEach(drawParticle);
        animFrameId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener("resize", function () {
        resize();
        // Re-distribute particles on big resize
        if (particles.length > 0) {
            particles.forEach(function (p) {
                if (p.x > width) p.x = Math.random() * width;
                if (p.y > height) p.y = Math.random() * height;
            });
        }
    });

    document.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener("mouseleave", function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Start
    init();
    animate();

    // Expose for external control
    window.ParticleSystem = {
        pause: function () {
            cancelAnimationFrame(animFrameId);
        },
        resume: function () {
            animate();
        },
    };
})();
