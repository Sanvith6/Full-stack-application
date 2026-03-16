/* ============================================
   VANGUARD PROTOCOL — ELITE Animation Engine
   Scroll reveals, counters, parallax, tilt, HUD
   ============================================ */

(function () {
    "use strict";

    /* ========== CINEMATIC LOADING SEQUENCE ========== */
    var loaderBar = document.getElementById("loader-bar");
    var loaderBarGlow = document.getElementById("loader-bar-glow");
    var loaderPct = document.getElementById("loader-pct");
    var loaderStatus = document.getElementById("loader-status");
    var loadingScreen = document.getElementById("loading-screen");

    var loadSteps = [
        { pct: 15, text: "LOADING ASSETS..." },
        { pct: 30, text: "INITIALIZING PROTOCOLS..." },
        { pct: 50, text: "BOOTSTRAPPING AGENTS..." },
        { pct: 70, text: "ESTABLISHING CONNECTION..." },
        { pct: 85, text: "CALIBRATING SYSTEMS..." },
        { pct: 95, text: "SYNCING DATA..." },
        { pct: 100, text: "PROTOCOL ACTIVE" },
    ];

    function runLoadSequence() {
        var i = 0;
        function nextStep() {
            if (i >= loadSteps.length) {
                setTimeout(function () {
                    if (loadingScreen) loadingScreen.classList.add("hidden");
                    // Start hero animations
                    setTimeout(animateHeroEntrance, 200);
                }, 500);
                return;
            }
            var step = loadSteps[i];
            if (loaderBar) loaderBar.style.width = step.pct + "%";
            if (loaderPct) loaderPct.textContent = step.pct + "%";
            if (loaderStatus) loaderStatus.textContent = step.text;
            i++;
            setTimeout(nextStep, 200 + Math.random() * 300);
        }
        setTimeout(nextStep, 400);
    }

    /* ========== HERO ENTRANCE SEQUENCE ========== */
    function animateHeroEntrance() {
        var items = document.querySelectorAll("#hero .anim-item, #hero .hero-stats-bar");
        items.forEach(function (item) {
            var delay = parseInt(item.getAttribute("data-delay") || "0", 10);
            setTimeout(function () {
                item.style.transition = "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)";
                item.style.opacity = "1";
                item.style.transform = "translateY(0) scale(1)";
            }, delay);
        });
    }

    /* ========== SCROLL REVEAL SYSTEM ========== */
    function initScrollReveal() {
        var selectors = ".agent-card, .arsenal-card, .tac-card, .tac-stat-card, .reveal-group, .section-header";
        var elements = document.querySelectorAll(selectors);

        if (!("IntersectionObserver" in window)) {
            elements.forEach(function (el) {
                el.style.opacity = "1";
                el.style.transform = "none";
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var delayAttr = el.getAttribute("data-delay") || "0";
                        var delay = parseInt(delayAttr, 10);
                        // For cards, multiply delay index
                        if (el.classList.contains("arsenal-card") ||
                            el.classList.contains("tac-stat-card") ||
                            el.classList.contains("agent-card")) {
                            delay = delay * 120;
                        }
                        setTimeout(function () {
                            el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
                            el.style.opacity = "1";
                            el.style.transform = "translateY(0) scale(1)";
                        }, delay);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        elements.forEach(function (el) { observer.observe(el); });
    }

    /* ========== ANIMATED COUNTERS ========== */
    function initCounters() {
        var counters = document.querySelectorAll(".counter");
        if (!counters.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        counters.forEach(function (c) { observer.observe(c); });
    }

    function animateCounter(el) {
        var target = parseInt(el.getAttribute("data-target"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1800;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        }
        requestAnimationFrame(step);
    }

    /* ========== METER / BAR FILL ========== */
    function initMeterFills() {
        var fills = document.querySelectorAll(".meter-fill, .tac-bar-fill");
        if (!fills.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var w = entry.target.getAttribute("data-width");
                        if (w) {
                            setTimeout(function () {
                                entry.target.style.width = w + "%";
                            }, 300);
                        }
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        fills.forEach(function (f) { observer.observe(f); });
    }

    /* ========== NAVBAR ========== */
    function initNavbar() {
        var navbar = document.getElementById("navbar");
        var sections = document.querySelectorAll(".section");
        var navLinks = document.querySelectorAll(".nav-link");
        var progressBar = document.getElementById("nav-progress-bar");

        setTimeout(function () {
            if (navbar) navbar.classList.add("visible");
        }, 100);

        window.addEventListener("scroll", function () {
            var scrollTop = window.pageYOffset;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            if (progressBar) progressBar.style.width = pct + "%";

            var current = "";
            sections.forEach(function (s) {
                if (scrollTop >= s.offsetTop - 120) {
                    current = s.getAttribute("id");
                }
            });
            navLinks.forEach(function (link) {
                link.classList.remove("active");
                if (link.getAttribute("data-section") === current) {
                    link.classList.add("active");
                }
            });
        });
    }

    /* ========== HUD OVERLAY ========== */
    function initHUD() {
        var hud = document.getElementById("hud-overlay");
        var coordEl = document.getElementById("hud-coord");
        var timeEl = document.getElementById("hud-time");
        var fpsEl = document.getElementById("hud-fps");
        var crosshair = document.getElementById("hud-crosshair");
        var spotlight = document.getElementById("mouse-spotlight");

        if (!hud) return;

        setTimeout(function () {
            hud.classList.add("visible");
            if (spotlight) spotlight.classList.add("visible");
        }, 200);

        document.addEventListener("mousemove", function (e) {
            if (coordEl) {
                coordEl.textContent = "X:" + String(e.clientX).padStart(4, "0") + " Y:" + String(e.clientY).padStart(4, "0");
            }
            if (crosshair) {
                crosshair.style.left = (e.clientX - 20) + "px";
                crosshair.style.top = (e.clientY - 20) + "px";
            }
            if (spotlight) {
                spotlight.style.left = e.clientX + "px";
                spotlight.style.top = e.clientY + "px";
            }
        });

        // Time
        function updateTime() {
            if (timeEl) {
                var now = new Date();
                timeEl.textContent =
                    String(now.getHours()).padStart(2, "0") + ":" +
                    String(now.getMinutes()).padStart(2, "0") + ":" +
                    String(now.getSeconds()).padStart(2, "0");
            }
            requestAnimationFrame(updateTime);
        }
        updateTime();

        // FPS
        var lastTime = performance.now();
        var frameCount = 0;
        function updateFPS() {
            frameCount++;
            var now = performance.now();
            if (now - lastTime >= 1000) {
                if (fpsEl) fpsEl.textContent = "FPS:" + frameCount;
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(updateFPS);
        }
        updateFPS();
    }

    /* ========== 3D CARD TILT ========== */
    function initCardTilt() {
        var cards = document.querySelectorAll(".agent-card");
        cards.forEach(function (card) {
            card.addEventListener("mousemove", function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var cx = rect.width / 2;
                var cy = rect.height / 2;
                var rotX = ((y - cy) / cy) * -5;
                var rotY = ((x - cx) / cx) * 5;
                card.style.transform =
                    "translateY(-10px) scale(1.02) perspective(800px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
            });
            card.addEventListener("mouseleave", function () {
                card.style.transform = "";
            });
        });
    }

    /* ========== CUSTOM CURSOR ========== */
    function initCursor() {
        if (window.innerWidth < 769) return;
        var ring = document.createElement("div");
        ring.className = "cursor-ring";
        document.body.appendChild(ring);

        document.addEventListener("mousemove", function (e) {
            ring.classList.add("visible");
            ring.style.left = e.clientX + "px";
            ring.style.top = e.clientY + "px";
        });
        document.addEventListener("mousedown", function () { ring.classList.add("click"); });
        document.addEventListener("mouseup", function () { ring.classList.remove("click"); });
        document.addEventListener("mouseleave", function () { ring.classList.remove("visible"); });
    }

    /* ========== SMOOTH ANCHOR SCROLLING ========== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener("click", function (e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute("href"));
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    /* ========== INIT ========== */
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
            setTimeout(initCardTilt, 2500);
        },
    };
})();
