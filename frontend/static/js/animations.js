/* ================================================================
   VANGUARD PROTOCOL — ELITE Animation Engine v2.0
   Cinematic loader, scroll reveals, counters, HUD, tilt,
   text scramble, magnetic buttons, parallax — pure vanilla JS
   ================================================================ */

(function () {
    "use strict";

    var EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

    /* ==========================================================
       §1  CINEMATIC LOADING SEQUENCE
       ========================================================== */
    var loadSteps = [
        { pct: 15,  text: "LOADING ASSETS..." },
        { pct: 30,  text: "INITIALIZING PROTOCOLS..." },
        { pct: 50,  text: "BOOTSTRAPPING AGENTS..." },
        { pct: 70,  text: "ESTABLISHING CONNECTION..." },
        { pct: 85,  text: "CALIBRATING SYSTEMS..." },
        { pct: 95,  text: "SYNCING DATA..." },
        { pct: 100, text: "PROTOCOL ACTIVE" }
    ];

    function runLoadSequence() {
        var bar    = document.getElementById("loader-bar");
        var pct    = document.getElementById("loader-pct");
        var status = document.getElementById("loader-status");
        var screen = document.getElementById("loading-screen");
        var i = 0;

        function next() {
            if (i >= loadSteps.length) {
                setTimeout(function () {
                    if (screen) screen.classList.add("hidden");
                    setTimeout(animateHeroEntrance, 200);
                }, 500);
                return;
            }
            var step = loadSteps[i];
            if (bar)    bar.style.width     = step.pct + "%";
            if (pct)    pct.textContent     = step.pct + "%";
            if (status) status.textContent  = step.text;
            i++;
            setTimeout(next, 200 + Math.random() * 300);
        }
        setTimeout(next, 400);
    }

    /* ==========================================================
       §2  HERO ENTRANCE SEQUENCE
       ========================================================== */
    function animateHeroEntrance() {
        var items = document.querySelectorAll("#hero .anim-item, #hero .hero-stats-bar");
        items.forEach(function (el) {
            var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
            setTimeout(function () {
                el.style.transition =
                    "opacity 0.8s " + EXPO_OUT + ", transform 0.8s " + EXPO_OUT;
                el.style.opacity   = "1";
                el.style.transform = "translateY(0) scale(1)";
            }, delay);
        });

        // Fire text scramble on hero title words after entrance settles
        setTimeout(triggerHeroScramble, 900);
    }

    /* ==========================================================
       §3  SCROLL REVEAL SYSTEM
       ========================================================== */
    function initScrollReveal() {
        var sel = ".agent-card, .arsenal-card, .tac-card, " +
                  ".tac-stat-card, .reveal-group, .section-header";
        var els = document.querySelectorAll(sel);

        if (!("IntersectionObserver" in window)) {
            els.forEach(function (el) {
                el.style.opacity   = "1";
                el.style.transform = "none";
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el    = entry.target;
                var raw   = parseInt(el.getAttribute("data-delay") || "0", 10);
                var delay = raw * 120;

                setTimeout(function () {
                    el.style.transition =
                        "opacity 0.7s " + EXPO_OUT + ", transform 0.7s " + EXPO_OUT;
                    el.style.opacity   = "1";
                    el.style.transform = "translateY(0) scale(1)";
                }, delay);
                observer.unobserve(el);
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

        els.forEach(function (el) { observer.observe(el); });
    }

    /* ==========================================================
       §4  ANIMATED COUNTERS
       ========================================================== */
    function initCounters() {
        var counters = document.querySelectorAll(".counter");
        if (!counters.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (c) { observer.observe(c); });
    }

    function animateCounter(el) {
        var target   = parseInt(el.getAttribute("data-target"), 10);
        var suffix   = el.getAttribute("data-suffix") || "";
        var duration = 1800;
        var start    = null;

        function tick(ts) {
            if (!start) start = ts;
            var p     = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else       el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
    }

    /* ==========================================================
       §5  METER / BAR FILL
       ========================================================== */
    function initMeterFills() {
        var fills = document.querySelectorAll(".meter-fill, .tac-bar-fill");
        if (!fills.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var w = entry.target.getAttribute("data-width");
                if (w) {
                    var el = entry.target;
                    setTimeout(function () { el.style.width = w + "%"; }, 300);
                }
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        fills.forEach(function (f) { observer.observe(f); });
    }

    /* ==========================================================
       §6  NAVBAR
       ========================================================== */
    function initNavbar() {
        var navbar      = document.getElementById("navbar");
        var progressBar = document.getElementById("nav-progress-bar");
        var sections    = document.querySelectorAll(".section");
        var navLinks    = document.querySelectorAll(".nav-link");

        setTimeout(function () {
            if (navbar) navbar.classList.add("visible");
        }, 100);

        window.addEventListener("scroll", function () {
            var scrollTop = window.pageYOffset;
            var docH      = document.documentElement.scrollHeight - window.innerHeight;
            var pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;

            if (progressBar) progressBar.style.width = pct + "%";

            var current = "";
            sections.forEach(function (s) {
                if (scrollTop >= s.offsetTop - 120) current = s.getAttribute("id");
            });
            navLinks.forEach(function (link) {
                link.classList.toggle("active",
                    link.getAttribute("data-section") === current);
            });
        });
    }

    /* ==========================================================
       §7  HUD OVERLAY
       ========================================================== */
    function initHUD() {
        var hud       = document.getElementById("hud-overlay");
        var coordEl   = document.getElementById("hud-coord");
        var timeEl    = document.getElementById("hud-time");
        var fpsEl     = document.getElementById("hud-fps");
        var crosshair = document.getElementById("hud-crosshair");
        var spotlight  = document.getElementById("mouse-spotlight");

        if (!hud) return;

        setTimeout(function () {
            hud.classList.add("visible");
            if (spotlight) spotlight.classList.add("visible");
        }, 200);

        document.addEventListener("mousemove", function (e) {
            var cx = e.clientX, cy = e.clientY;
            if (coordEl) {
                coordEl.textContent =
                    "X:" + String(cx).padStart(4, "0") +
                    " Y:" + String(cy).padStart(4, "0");
            }
            if (crosshair) {
                crosshair.style.left = (cx - 20) + "px";
                crosshair.style.top  = (cy - 20) + "px";
            }
            if (spotlight) {
                spotlight.style.left = cx + "px";
                spotlight.style.top  = cy + "px";
            }
        });

        /* Real-time clock */
        function updateTime() {
            if (timeEl) {
                var d = new Date();
                timeEl.textContent =
                    String(d.getHours()).padStart(2, "0") + ":" +
                    String(d.getMinutes()).padStart(2, "0") + ":" +
                    String(d.getSeconds()).padStart(2, "0");
            }
            requestAnimationFrame(updateTime);
        }
        updateTime();

        /* FPS counter */
        var lastT = performance.now(), frames = 0;
        function updateFPS() {
            frames++;
            var now = performance.now();
            if (now - lastT >= 1000) {
                if (fpsEl) fpsEl.textContent = "FPS:" + frames;
                frames = 0;
                lastT  = now;
            }
            requestAnimationFrame(updateFPS);
        }
        updateFPS();
    }

    /* ==========================================================
       §8  3D CARD TILT
       ========================================================== */
    function initCardTilt() {
        document.querySelectorAll(".agent-card").forEach(function (card) {
            card.addEventListener("mousemove", function (e) {
                var rect = card.getBoundingClientRect();
                var cx   = rect.width / 2;
                var cy   = rect.height / 2;
                var x    = e.clientX - rect.left;
                var y    = e.clientY - rect.top;
                var rotX = ((y - cy) / cy) * -5;
                var rotY = ((x - cx) / cx) *  5;
                card.style.transform =
                    "perspective(800px) rotateX(" + rotX + "deg) rotateY(" +
                    rotY + "deg) translateY(-10px) scale(1.02)";
            });
            card.addEventListener("mouseleave", function () {
                card.style.transform = "";
            });
        });
    }

    /* ==========================================================
       §9  CUSTOM CURSOR
       ========================================================== */
    function initCursor() {
        if (window.innerWidth <= 768) return;

        var ring = document.createElement("div");
        ring.className = "cursor-ring";
        document.body.appendChild(ring);

        document.addEventListener("mousemove", function (e) {
            ring.classList.add("visible");
            ring.style.left = e.clientX + "px";
            ring.style.top  = e.clientY + "px";
        });
        document.addEventListener("mousedown", function () {
            ring.classList.add("click");
        });
        document.addEventListener("mouseup", function () {
            ring.classList.remove("click");
        });
        document.addEventListener("mouseleave", function () {
            ring.classList.remove("visible");
        });
    }

    /* ==========================================================
       §10  SMOOTH ANCHOR SCROLLING
       ========================================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener("click", function (e) {
                var href = this.getAttribute("href");
                var dest = document.querySelector(href);
                if (dest) {
                    e.preventDefault();
                    dest.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    /* ==========================================================
       §11  TEXT SCRAMBLE EFFECT
       ========================================================== */
    // Underscores act as weighted blanks so mid-scramble text feels spacious
    var SCRAMBLE_CHARS =
        "!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function scrambleText(element, finalText, duration) {
        if (!element) return;
        var length    = finalText.length;
        var startTime = null;

        // Pre-compute a random resolve-time for each character (0…1)
        var resolveAt = [];
        for (var i = 0; i < length; i++) {
            resolveAt.push(Math.random() * 0.8 + 0.1); // resolve between 10-90% of duration
        }

        function randomChar() {
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }

        function frame(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var output   = "";

            for (var j = 0; j < length; j++) {
                if (finalText[j] === " ") {
                    output += " ";
                } else if (progress >= resolveAt[j]) {
                    output += finalText[j];
                } else {
                    output += randomChar();
                }
            }

            element.textContent = output;
            if (progress < 1) requestAnimationFrame(frame);
            else element.textContent = finalText;
        }
        requestAnimationFrame(frame);
    }

    function triggerHeroScramble() {
        var heroTitle = document.querySelector("#hero .hero-title");
        if (!heroTitle) return;

        var words = heroTitle.querySelectorAll("span");
        if (words.length) {
            words.forEach(function (span, idx) {
                var text = span.textContent;
                setTimeout(function () {
                    scrambleText(span, text, 800);
                }, idx * 200);
            });
        } else {
            scrambleText(heroTitle, heroTitle.textContent, 1000);
        }
    }

    /* ==========================================================
       §12  MAGNETIC BUTTON EFFECT
       ========================================================== */
    function initMagneticButtons() {
        var RADIUS   = 100;
        var STRENGTH = 0.3;
        var MAX_DIST = 8;

        document.querySelectorAll(".btn").forEach(function (btn) {
            btn.addEventListener("mousemove", function (e) {
                var rect = btn.getBoundingClientRect();
                var cx   = rect.left + rect.width  / 2;
                var cy   = rect.top  + rect.height / 2;
                var dx   = e.clientX - cx;
                var dy   = e.clientY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < RADIUS) {
                    var tx = Math.max(-MAX_DIST, Math.min(MAX_DIST, dx * STRENGTH));
                    var ty = Math.max(-MAX_DIST, Math.min(MAX_DIST, dy * STRENGTH));
                    btn.style.transition = "transform 0.2s ease-out";
                    btn.style.transform  = "translate(" + tx + "px, " + ty + "px)";
                }
            });

            btn.addEventListener("mouseleave", function () {
                btn.style.transition = "transform 0.35s ease-out";
                btn.style.transform  = "translate(0px, 0px)";
            });
        });
    }

    /* ==========================================================
       §13  PARALLAX ON MOUSE MOVE
       ========================================================== */
    function initParallax() {
        if (window.innerWidth <= 768) return;

        var items = document.querySelectorAll("[data-parallax-speed]");
        if (!items.length) return;

        var halfW = window.innerWidth  / 2;
        var halfH = window.innerHeight / 2;

        window.addEventListener("resize", function () {
            halfW = window.innerWidth  / 2;
            halfH = window.innerHeight / 2;
        });

        document.addEventListener("mousemove", function (e) {
            var mx = e.clientX - halfW;
            var my = e.clientY - halfH;

            items.forEach(function (el) {
                var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0.02;
                var tx    = mx * speed;
                var ty    = my * speed;
                el.style.transform = "translate(" + tx + "px, " + ty + "px)";
            });
        });
    }

    /* ==========================================================
       INIT — public API
       ========================================================== */
    window.AnimEngine = {
        init: function () {
            runLoadSequence();
            initScrollReveal();
            initCounters();
            initMeterFills();
            initNavbar();
            initHUD();
            initSmoothScroll();
            initCursor();
            initMagneticButtons();
            initParallax();
            setTimeout(initCardTilt, 2500);
        }
    };
})();
