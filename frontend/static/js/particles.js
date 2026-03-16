/* ============================================
   VANGUARD PROTOCOL — ELITE Particle System
   Multi-layer canvas: particles + energy beams
   ============================================ */

(function () {
    "use strict";

    /* ========== PARTICLE CANVAS ========== */
    var canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width, height;
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var animId;

    var PCONFIG = {
        count: 100,
        maxSize: 2,
        minSize: 0.3,
        speed: 0.25,
        connectionDist: 140,
        mouseRadius: 250,
        mouseForce: 0.025,
        colors: ["#ff4655", "#00d4aa", "#ece8e1", "#ff465580", "#00d4aa80"],
        lineColor: "255, 70, 85",
    };

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function makeParticle() {
        var c = PCONFIG.colors[Math.floor(Math.random() * PCONFIG.colors.length)];
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * PCONFIG.speed,
            vy: (Math.random() - 0.5) * PCONFIG.speed,
            size: PCONFIG.minSize + Math.random() * (PCONFIG.maxSize - PCONFIG.minSize),
            color: c,
            alpha: 0.2 + Math.random() * 0.6,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * 0.02,
        };
    }

    function initParticles() {
        resizeCanvas();
        particles = [];
        var count = Math.min(PCONFIG.count, Math.floor((width * height) / 12000));
        for (var i = 0; i < count; i++) {
            particles.push(makeParticle());
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);

        // Connections
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < PCONFIG.connectionDist) {
                    var opacity = 0.08 * (1 - dist / PCONFIG.connectionDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = "rgba(" + PCONFIG.lineColor + "," + opacity + ")";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Particles
        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];

            // Pulse alpha
            p.pulse += p.pulseSpeed;
            var pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.15;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0.05, pulseAlpha);
            ctx.fill();

            // Glow effect for larger particles
            if (p.size > 1.2) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.03;
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    function updateParticles() {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            // Mouse interaction
            var dx = p.x - mouse.x;
            var dy = p.y - mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < PCONFIG.mouseRadius && dist > 0) {
                var force = (PCONFIG.mouseRadius - dist) / PCONFIG.mouseRadius;
                p.vx += (dx / dist) * force * PCONFIG.mouseForce;
                p.vy += (dy / dist) * force * PCONFIG.mouseForce;
            }

            p.vx *= 0.992;
            p.vy *= 0.992;
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;
        }
    }

    function animateParticles() {
        updateParticles();
        drawParticles();
        animId = requestAnimationFrame(animateParticles);
    }

    /* ========== ENERGY CANVAS ========== */
    var eCanvas = document.getElementById("energy-canvas");
    var eCtx = eCanvas ? eCanvas.getContext("2d") : null;
    var energyBeams = [];
    var eAnimId;

    function resizeEnergy() {
        if (!eCanvas) return;
        eCanvas.width = window.innerWidth;
        eCanvas.height = window.innerHeight;
    }

    function initEnergy() {
        if (!eCanvas) return;
        resizeEnergy();
        energyBeams = [];
        for (var i = 0; i < 5; i++) {
            energyBeams.push({
                x: Math.random() * eCanvas.width,
                y: Math.random() * eCanvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 100 + Math.random() * 200,
                hue: Math.random() > 0.5 ? 354 : 163,
                alpha: 0.01 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    function animateEnergy() {
        if (!eCtx) return;
        eCtx.clearRect(0, 0, eCanvas.width, eCanvas.height);

        for (var i = 0; i < energyBeams.length; i++) {
            var b = energyBeams[i];
            b.phase += 0.005;
            b.x += b.vx + Math.sin(b.phase) * 0.3;
            b.y += b.vy + Math.cos(b.phase) * 0.3;

            if (b.x < -b.radius) b.x = eCanvas.width + b.radius;
            if (b.x > eCanvas.width + b.radius) b.x = -b.radius;
            if (b.y < -b.radius) b.y = eCanvas.height + b.radius;
            if (b.y > eCanvas.height + b.radius) b.y = -b.radius;

            var gradient = eCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
            gradient.addColorStop(0, "hsla(" + b.hue + ", 100%, 50%, " + b.alpha + ")");
            gradient.addColorStop(1, "hsla(" + b.hue + ", 100%, 50%, 0)");
            eCtx.fillStyle = gradient;
            eCtx.fillRect(b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
        }

        eAnimId = requestAnimationFrame(animateEnergy);
    }

    /* ========== RADAR CANVAS ========== */
    function initRadar() {
        var radarCanvas = document.getElementById("radar-canvas");
        if (!radarCanvas) return;

        var rCtx = radarCanvas.getContext("2d");
        var rW = radarCanvas.width;
        var rH = radarCanvas.height;
        var cx = rW / 2;
        var cy = rH / 2;
        var maxR = Math.min(cx, cy) - 20;
        var sweepAngle = 0;

        // Generate some radar "blips"
        var blips = [];
        for (var i = 0; i < 8; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = 0.3 + Math.random() * 0.6;
            blips.push({
                angle: angle,
                dist: dist,
                size: 2 + Math.random() * 3,
                alpha: 0.3 + Math.random() * 0.7,
                color: Math.random() > 0.3 ? "#ff4655" : "#00d4aa",
            });
        }

        function drawRadar() {
            rCtx.clearRect(0, 0, rW, rH);

            // Background circles
            rCtx.strokeStyle = "#ffffff08";
            rCtx.lineWidth = 0.5;
            for (var r = 1; r <= 4; r++) {
                rCtx.beginPath();
                rCtx.arc(cx, cy, maxR * (r / 4), 0, Math.PI * 2);
                rCtx.stroke();
            }

            // Cross lines
            rCtx.beginPath();
            rCtx.moveTo(cx - maxR, cy);
            rCtx.lineTo(cx + maxR, cy);
            rCtx.moveTo(cx, cy - maxR);
            rCtx.lineTo(cx, cy + maxR);
            rCtx.strokeStyle = "#ffffff06";
            rCtx.stroke();

            // Sweep
            sweepAngle += 0.015;
            var sweepGrad = rCtx.createConicalGradient
                ? null
                : null;

            // Draw sweep as arc segment
            rCtx.beginPath();
            rCtx.moveTo(cx, cy);
            rCtx.arc(cx, cy, maxR, sweepAngle - 0.5, sweepAngle, false);
            rCtx.closePath();
            var sg = rCtx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
            sg.addColorStop(0, "rgba(255, 70, 85, 0.15)");
            sg.addColorStop(1, "rgba(255, 70, 85, 0.02)");
            rCtx.fillStyle = sg;
            rCtx.fill();

            // Sweep line
            rCtx.beginPath();
            rCtx.moveTo(cx, cy);
            rCtx.lineTo(
                cx + Math.cos(sweepAngle) * maxR,
                cy + Math.sin(sweepAngle) * maxR
            );
            rCtx.strokeStyle = "rgba(255, 70, 85, 0.6)";
            rCtx.lineWidth = 1;
            rCtx.stroke();

            // Blips
            for (var b = 0; b < blips.length; b++) {
                var blip = blips[b];
                var bx = cx + Math.cos(blip.angle) * blip.dist * maxR;
                var by = cy + Math.sin(blip.angle) * blip.dist * maxR;

                // Fade based on sweep proximity
                var angleDiff = ((sweepAngle - blip.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                var fadeFactor = angleDiff < 1 ? (1 - angleDiff) : 0.1;

                rCtx.beginPath();
                rCtx.arc(bx, by, blip.size, 0, Math.PI * 2);
                rCtx.fillStyle = blip.color;
                rCtx.globalAlpha = blip.alpha * fadeFactor;
                rCtx.fill();

                // Glow
                rCtx.beginPath();
                rCtx.arc(bx, by, blip.size * 3, 0, Math.PI * 2);
                rCtx.globalAlpha = 0.05 * fadeFactor;
                rCtx.fill();
            }
            rCtx.globalAlpha = 1;

            // Center dot
            rCtx.beginPath();
            rCtx.arc(cx, cy, 3, 0, Math.PI * 2);
            rCtx.fillStyle = "#ff4655";
            rCtx.fill();

            requestAnimationFrame(drawRadar);
        }

        drawRadar();
    }

    /* ========== EVENT LISTENERS ========== */
    window.addEventListener("resize", function () {
        resizeCanvas();
        resizeEnergy();
        particles.forEach(function (p) {
            if (p.x > width) p.x = Math.random() * width;
            if (p.y > height) p.y = Math.random() * height;
        });
    });

    document.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener("mouseleave", function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    /* ========== START ========== */
    initParticles();
    animateParticles();
    initEnergy();
    animateEnergy();

    // Radar initializes after DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRadar);
    } else {
        initRadar();
    }

    window.ParticleSystem = {
        pause: function () { cancelAnimationFrame(animId); cancelAnimationFrame(eAnimId); },
        resume: function () { animateParticles(); animateEnergy(); },
    };
})();
