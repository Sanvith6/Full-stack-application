/* =====================================================================
   VANGUARD PROTOCOL — GOD-TIER Particle System v2.0
   Multi-layer canvas: particles + energy orbs + radar + WebGL shader
   Cursor trail system — Pure vanilla JS IIFE
   ===================================================================== */

(function () {
    "use strict";

    /* ==========================================================
       §1  CONFIGURATION
       ========================================================== */
    var COLORS = ["#ff4655", "#00d4aa", "#ece8e1", "#ff465560", "#00d4aa60"];
    var IS_DESKTOP = window.innerWidth > 768;

    var PCONFIG = {
        count: IS_DESKTOP ? 150 : Math.max(30, Math.floor((window.innerWidth * window.innerHeight) / 15000)),
        maxSize: 2.5,
        minSize: 0.3,
        speed: 0.22,
        connectionDist: 150,
        mouseRadius: 260,
        mouseForce: 0.03,
        trailLength: 6,
        colors: COLORS,
        lineColor: "255, 70, 85"
    };

    var paused = false;
    var mouse = { x: -9999, y: -9999 };
    var animFrameId = null;

    /* ==========================================================
       §2  UTILITY HELPERS
       ========================================================== */
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function dist(x1, y1, x2, y2) { var dx = x1 - x2, dy = y1 - y2; return Math.sqrt(dx * dx + dy * dy); }

    function sizeCanvas(canvas) {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /* ==========================================================
       §3  PARTICLE CANVAS  (#particle-canvas)
       Trails, glow, pulsing alpha, mouse repulsion, connections
       ========================================================== */
    var pCanvas = document.getElementById("particle-canvas");
    var pCtx = pCanvas ? pCanvas.getContext("2d") : null;
    var particles = [];

    function createParticle() {
        var size = rand(PCONFIG.minSize, PCONFIG.maxSize);
        return {
            x: rand(0, pCanvas.width),
            y: rand(0, pCanvas.height),
            vx: rand(-PCONFIG.speed, PCONFIG.speed),
            vy: rand(-PCONFIG.speed, PCONFIG.speed),
            size: size,
            color: PCONFIG.colors[Math.floor(rand(0, PCONFIG.colors.length))],
            phase: rand(0, Math.PI * 2),
            trail: []
        };
    }

    function initParticles() {
        particles = [];
        for (var i = 0; i < PCONFIG.count; i++) particles.push(createParticle());
    }

    function updateParticles() {
        var w = pCanvas.width, h = pCanvas.height;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            // Store trail position
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > PCONFIG.trailLength) p.trail.shift();

            // Mouse repulsion
            var dx = p.x - mouse.x, dy = p.y - mouse.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < PCONFIG.mouseRadius && d > 0) {
                var force = (1 - d / PCONFIG.mouseRadius) * PCONFIG.mouseForce;
                p.vx += (dx / d) * force;
                p.vy += (dy / d) * force;
            }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

            p.x += p.vx;
            p.y += p.vy;

            // Wrap-around edges
            if (p.x < 0) p.x += w; else if (p.x > w) p.x -= w;
            if (p.y < 0) p.y += h; else if (p.y > h) p.y -= h;

            // Pulsing phase
            p.phase += 0.02;
        }
    }

    function drawParticles(time) {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

        // Connection lines
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var d = dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                if (d < PCONFIG.connectionDist) {
                    var alpha = 1 - d / PCONFIG.connectionDist;
                    pCtx.beginPath();
                    pCtx.strokeStyle = "rgba(" + PCONFIG.lineColor + "," + (alpha * 0.35).toFixed(3) + ")";
                    pCtx.lineWidth = 0.5;
                    pCtx.moveTo(particles[i].x, particles[i].y);
                    pCtx.lineTo(particles[j].x, particles[j].y);
                    pCtx.stroke();
                }
            }
        }

        // Particles with trails and glow
        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];
            var pulse = 0.6 + 0.4 * Math.sin(p.phase);

            // Trail
            for (var t = 0; t < p.trail.length; t++) {
                var trailAlpha = ((t + 1) / p.trail.length) * 0.25 * pulse;
                var trailSize = p.size * ((t + 1) / p.trail.length) * 0.8;
                pCtx.beginPath();
                pCtx.arc(p.trail[t].x, p.trail[t].y, trailSize, 0, Math.PI * 2);
                pCtx.fillStyle = "rgba(255,70,85," + trailAlpha.toFixed(3) + ")";
                pCtx.fill();
            }

            // Soft glow for larger particles
            if (p.size > 1.5) {
                pCtx.beginPath();
                pCtx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                pCtx.fillStyle = "rgba(255,70,85," + (0.04 * pulse).toFixed(3) + ")";
                pCtx.fill();
            }

            // Main dot
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pCtx.fillStyle = p.color;
            pCtx.globalAlpha = pulse;
            pCtx.fill();
            pCtx.globalAlpha = 1;
        }
    }

    /* ==========================================================
       §4  ENERGY CANVAS  (#energy-canvas)
       Floating radial-gradient orbs with sine/cosine drift
       ========================================================== */
    var eCanvas = document.getElementById("energy-canvas");
    var eCtx = eCanvas ? eCanvas.getContext("2d") : null;
    var orbs = [];

    function initOrbs() {
        orbs = [];
        var count = Math.floor(rand(6, 9));
        var accentColors = ["#ff4655", "#00d4aa", "#ece8e1"];
        for (var i = 0; i < count; i++) {
            orbs.push({
                x: rand(0, eCanvas.width),
                y: rand(0, eCanvas.height),
                r: rand(150, 350),
                freqX: rand(0.0003, 0.001),
                freqY: rand(0.0003, 0.001),
                ampX: rand(100, 300),
                ampY: rand(80, 250),
                baseX: rand(0, eCanvas.width),
                baseY: rand(0, eCanvas.height),
                phase: rand(0, Math.PI * 2),
                color: accentColors[i % accentColors.length],
                opacity: rand(0.01, 0.03)
            });
        }
    }

    function drawOrbs(time) {
        eCtx.clearRect(0, 0, eCanvas.width, eCanvas.height);
        for (var i = 0; i < orbs.length; i++) {
            var o = orbs[i];
            o.x = o.baseX + Math.sin(time * o.freqX + o.phase) * o.ampX;
            o.y = o.baseY + Math.cos(time * o.freqY + o.phase) * o.ampY;

            var grad = eCtx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
            grad.addColorStop(0, o.color);
            grad.addColorStop(1, "transparent");
            eCtx.globalAlpha = o.opacity;
            eCtx.beginPath();
            eCtx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            eCtx.fillStyle = grad;
            eCtx.fill();
        }
        eCtx.globalAlpha = 1;
    }

    /* ==========================================================
       §5  RADAR CANVAS  (#radar-canvas)
       Sweep line, concentric circles, blips, crosshair grid
       ========================================================== */
    var rCanvas = document.getElementById("radar-canvas");
    var rCtx = rCanvas ? rCanvas.getContext("2d") : null;
    var radarAngle = 0;
    var blips = [];

    function initBlips() {
        blips = [];
        var count = Math.floor(rand(8, 13));
        for (var i = 0; i < count; i++) {
            blips.push({
                angle: rand(0, Math.PI * 2),
                dist: rand(0.15, 0.9),
                size: rand(1.5, 3.5),
                brightness: 1
            });
        }
    }

    function drawRadar(time) {
        if (!rCtx) return;
        var w = rCanvas.width, h = rCanvas.height;
        var cx = w / 2, cy = h / 2;
        var maxR = Math.min(cx, cy) * 0.85;

        rCtx.clearRect(0, 0, w, h);
        radarAngle += 0.008;

        // Concentric circles
        rCtx.strokeStyle = "rgba(0,212,170,0.06)";
        rCtx.lineWidth = 0.5;
        for (var i = 1; i <= 5; i++) {
            rCtx.beginPath();
            rCtx.arc(cx, cy, maxR * (i / 5), 0, Math.PI * 2);
            rCtx.stroke();
        }

        // Crosshair grid lines
        rCtx.strokeStyle = "rgba(0,212,170,0.04)";
        rCtx.beginPath();
        rCtx.moveTo(cx - maxR, cy); rCtx.lineTo(cx + maxR, cy);
        rCtx.moveTo(cx, cy - maxR); rCtx.lineTo(cx, cy + maxR);
        // Diagonal lines
        var dOff = maxR * 0.707;
        rCtx.moveTo(cx - dOff, cy - dOff); rCtx.lineTo(cx + dOff, cy + dOff);
        rCtx.moveTo(cx + dOff, cy - dOff); rCtx.lineTo(cx - dOff, cy + dOff);
        rCtx.stroke();

        // Sweep arc tail (series of fading lines)

        for (var s = 0; s < 30; s++) {
            var a = radarAngle - s * 0.015;
            var alpha = (1 - s / 30) * 0.12;
            rCtx.beginPath();
            rCtx.moveTo(cx, cy);
            rCtx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
            rCtx.strokeStyle = "rgba(255,70,85," + alpha.toFixed(3) + ")";
            rCtx.lineWidth = 1.5;
            rCtx.stroke();
        }

        // Main sweep line (brighter)
        rCtx.beginPath();
        rCtx.moveTo(cx, cy);
        rCtx.lineTo(cx + Math.cos(radarAngle) * maxR, cy + Math.sin(radarAngle) * maxR);
        rCtx.strokeStyle = "rgba(0,212,170,0.5)";
        rCtx.lineWidth = 1.5;
        rCtx.stroke();

        // Blips — fade based on angular proximity to sweep
        for (var b = 0; b < blips.length; b++) {
            var bp = blips[b];
            var angleDiff = radarAngle - bp.angle;
            // Normalize to 0..2π
            angleDiff = ((angleDiff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            bp.brightness = angleDiff < 0.5 ? 1 : Math.max(0, 1 - (angleDiff - 0.5) / 4);

            if (bp.brightness > 0.02) {
                var bx = cx + Math.cos(bp.angle) * maxR * bp.dist;
                var by = cy + Math.sin(bp.angle) * maxR * bp.dist;
                rCtx.beginPath();
                rCtx.arc(bx, by, bp.size, 0, Math.PI * 2);
                rCtx.fillStyle = "rgba(255,70,85," + (bp.brightness * 0.8).toFixed(3) + ")";
                rCtx.fill();
                // Glow ring
                rCtx.beginPath();
                rCtx.arc(bx, by, bp.size * 2.5, 0, Math.PI * 2);
                rCtx.fillStyle = "rgba(255,70,85," + (bp.brightness * 0.15).toFixed(3) + ")";
                rCtx.fill();
            }
        }

        // Center dot
        rCtx.beginPath();
        rCtx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        rCtx.fillStyle = "rgba(0,212,170,0.7)";
        rCtx.fill();
    }

    /* ==========================================================
       §6  CURSOR TRAIL SYSTEM  (DOM-based, desktop only)
       Array of divs that follow the cursor with delay & fade
       ========================================================== */
    var trailDots = [];
    var TRAIL_COUNT = 18;
    var trailContainer = null;

    function initCursorTrail() {
        if (!IS_DESKTOP) return;
        trailContainer = document.createElement("div");
        trailContainer.className = "cursor-trail";
        trailContainer.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
        document.body.appendChild(trailContainer);

        for (var i = 0; i < TRAIL_COUNT; i++) {
            var dot = document.createElement("div");
            dot.style.cssText =
                "position:absolute;width:6px;height:6px;border-radius:50%;" +
                "background:#ff4655;pointer-events:none;transform:translate(-50%,-50%);" +
                "opacity:0;transition:none;will-change:transform,opacity;";
            trailContainer.appendChild(dot);
            trailDots.push({ el: dot, x: -100, y: -100, life: 0 });
        }
    }

    var trailIndex = 0;
    function spawnTrailDot(mx, my) {
        if (!IS_DESKTOP || !trailDots.length) return;
        var d = trailDots[trailIndex];
        d.x = mx;
        d.y = my;
        d.life = 1;
        trailIndex = (trailIndex + 1) % TRAIL_COUNT;
    }

    function updateCursorTrail() {
        for (var i = 0; i < trailDots.length; i++) {
            var d = trailDots[i];
            if (d.life <= 0) continue;
            d.life -= 0.04;
            if (d.life < 0) d.life = 0;
            var scale = d.life;
            d.el.style.opacity = (d.life * 0.7).toFixed(2);
            d.el.style.transform = "translate(" + d.x + "px," + d.y + "px) translate(-50%,-50%) scale(" + scale.toFixed(2) + ")";
        }
    }

    /* ==========================================================
       §7  WEBGL BACKGROUND SHADER  (#shader-canvas)
       Animated plasma / noise — falls back gracefully
       ========================================================== */
    var gl = null;
    var shaderCanvas = null;
    var shaderProgram = null;
    var uTime = null, uResolution = null, uMouse = null;
    var webglActive = false;

    var VERT_SRC =
        "attribute vec2 a_position;" +
        "void main(){gl_Position=vec4(a_position,0.0,1.0);}";

    var FRAG_SRC =
        "precision mediump float;" +
        "uniform float u_time;" +
        "uniform vec2 u_resolution;" +
        "uniform vec2 u_mouse;" +
        "void main(){" +
        "  vec2 uv=gl_FragCoord.xy/u_resolution;" +
        "  float n=sin(uv.x*10.0+u_time)*sin(uv.y*10.0+u_time*0.7);" +
        "  n+=sin(length(uv-u_mouse)*8.0-u_time*2.0)*0.5;" +
        "  vec3 col=vec3(0.02)+vec3(n*0.015,n*0.005,n*0.01);" +
        "  gl_FragColor=vec4(col,1.0);" +
        "}";

    function compileShader(src, type) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            gl.deleteShader(s);
            return null;
        }
        return s;
    }

    function initWebGL() {
        shaderCanvas = document.getElementById("shader-canvas");
        if (!shaderCanvas) {
            shaderCanvas = document.createElement("canvas");
            shaderCanvas.id = "shader-canvas";
            shaderCanvas.style.cssText =
                "position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;";
            document.body.prepend(shaderCanvas);
        }
        sizeCanvas(shaderCanvas);

        try {
            gl = shaderCanvas.getContext("webgl") || shaderCanvas.getContext("experimental-webgl");
        } catch (e) { /* no WebGL */ }
        if (!gl) { shaderCanvas.style.display = "none"; return; }

        var vert = compileShader(VERT_SRC, gl.VERTEX_SHADER);
        var frag = compileShader(FRAG_SRC, gl.FRAGMENT_SHADER);
        if (!vert || !frag) { gl = null; return; }

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vert);
        gl.attachShader(shaderProgram, frag);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { gl = null; return; }

        gl.useProgram(shaderProgram);

        // Full-screen quad
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        var aPos = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        uTime = gl.getUniformLocation(shaderProgram, "u_time");
        uResolution = gl.getUniformLocation(shaderProgram, "u_resolution");
        uMouse = gl.getUniformLocation(shaderProgram, "u_mouse");

        webglActive = true;
    }

    function drawWebGL(time) {
        if (!webglActive) return;
        gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
        gl.uniform1f(uTime, time * 0.001);
        gl.uniform2f(uResolution, shaderCanvas.width, shaderCanvas.height);
        var mx = mouse.x < 0 ? 0.5 : mouse.x / shaderCanvas.width;
        var my = mouse.y < 0 ? 0.5 : 1.0 - mouse.y / shaderCanvas.height;
        gl.uniform2f(uMouse, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    /* ==========================================================
       §8  MAIN ANIMATION LOOP
       ========================================================== */
    function loop(time) {
        animFrameId = requestAnimationFrame(loop);
        if (paused) return;

        if (pCtx) { updateParticles(); drawParticles(time); }
        if (eCtx) { drawOrbs(time); }
        drawRadar(time);
        drawWebGL(time);
        updateCursorTrail();
    }

    /* ==========================================================
       §9  RESIZE HANDLER
       ========================================================== */
    function onResize() {
        var canvases = [pCanvas, eCanvas, rCanvas];
        for (var i = 0; i < canvases.length; i++) sizeCanvas(canvases[i]);
        if (shaderCanvas) sizeCanvas(shaderCanvas);

        // Clamp particles inside new bounds
        if (pCanvas) {
            for (var j = 0; j < particles.length; j++) {
                if (particles[j].x > pCanvas.width) particles[j].x = pCanvas.width * Math.random();
                if (particles[j].y > pCanvas.height) particles[j].y = pCanvas.height * Math.random();
            }
        }
        // Re-anchor energy orbs
        if (eCanvas) {
            for (var k = 0; k < orbs.length; k++) {
                orbs[k].baseX = rand(0, eCanvas.width);
                orbs[k].baseY = rand(0, eCanvas.height);
            }
        }
    }

    /* ==========================================================
       §10  EVENT LISTENERS
       ========================================================== */
    var throttleMove = 0;
    window.addEventListener("mousemove", function (e) {
        var now = Date.now();
        if (now - throttleMove < 16) return;
        throttleMove = now;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        spawnTrailDot(e.clientX, e.clientY);
    });

    window.addEventListener("mouseleave", function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onResize, 150);
    });

    /* ==========================================================
       §11  INITIALIZATION
       ========================================================== */
    function init() {
        if (pCanvas) { sizeCanvas(pCanvas); initParticles(); }
        if (eCanvas) { sizeCanvas(eCanvas); initOrbs(); }
        if (rCanvas) { sizeCanvas(rCanvas); initBlips(); }
        initWebGL();
        initCursorTrail();
        loop(0);
    }

    /* ==========================================================
       §12  PUBLIC API — window.ParticleSystem
       ========================================================== */
    window.ParticleSystem = {
        pause: function () {
            paused = true;
        },
        resume: function () {
            paused = false;
        },
        isPaused: function () {
            return paused;
        }
    };

    /* Kick off once DOM is ready */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
