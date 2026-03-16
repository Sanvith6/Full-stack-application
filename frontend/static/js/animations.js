/* ============================================
   VANGUARD PROTOCOL — Animations Engine
   Scroll reveals, counters, intersection observers
   ============================================ */

(function () {
    "use strict";

    /* ---------- Loading Sequence ---------- */
    var loaderBar = document.getElementById("loader-bar");
    var loaderStatus = document.getElementById("loader-status");
    var loadingScreen = document.getElementById("loading-screen");

    var loadSteps = [
        { pct: 20, text: "LOADING ASSETS..." },
        { pct: 45, text: "INITIALIZING AGENTS..." },
        { pct: 70, text: "CONNECTING TO SERVER..." },
        { pct: 90, text: "ESTABLISHING PROTOCOL..." },
        { pct: 100, text: "READY" },
    ];

    function runLoadSequence() {
        var i = 0;
        function nextStep() {
            if (i >= loadSteps.length) {
                setTimeout(function () {
                    loadingScreen.classList.add("hidden");
                    document.getElementById("navbar").classList.add("visible");
                    animateHero();
                }, 400);
                return;
            }
            if (loaderBar) loaderBar.style.width = loadSteps[i].pct + "%";
            if (loaderStatus) loaderStatus.textContent = loadSteps[i].text;
            i++;
            setTimeout(nextStep, 350 + Math.random() * 250);
        }
        setTimeout(nextStep, 300);
    }

    /* ---------- Hero Entrance Animations ---------- */
    function animateHero() {
        var badge = document.querySelector(".hero-badge");
        var titleLines = document.querySelectorAll(".title-line");
        var subtitle = document.querySelector(".hero-subtitle");
        var cta = document.querySelector(".hero-cta");
        var stats = document.getElementById("hero-stats");

        var delay = 0;

        if (badge) {
            setTimeout(function () {
                badge.style.transition =
                    "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)";
                badge.style.opacity = "1";
                badge.style.transform = "translateY(0)";
            }, delay);
            delay += 200;
        }

        titleLines.forEach(function (line) {
            setTimeout(function () {
                line.style.transition =
                    "opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo)";
                line.style.opacity = "1";
                line.style.transform = "translateY(0)";
            }, delay);
            delay += 150;
        });

        if (subtitle) {
            setTimeout(function () {
                subtitle.style.transition =
                    "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)";
                subtitle.style.opacity = "1";
                subtitle.style.transform = "translateY(0)";
            }, delay);
            delay += 200;
        }

        if (cta) {
            setTimeout(function () {
                cta.style.transition =
                    "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)";
                cta.style.opacity = "1";
                cta.style.transform = "translateY(0)";
            }, delay);
            delay += 200;
        }

        if (stats) {
            setTimeout(function () {
                stats.style.transition =
                    "opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo)";
                stats.style.opacity = "1";
                stats.style.transform = "translateY(0)";
                startCounters();
            }, delay);
        }
    }

    /* ---------- Counter Animation ---------- */
    function startCounters() {
        var counters = document.querySelectorAll(".stat-number[data-target]");
        counters.forEach(function (el) {
            var target = parseInt(el.getAttribute("data-target"), 10);
            var duration = 1500;
            var startTime = null;

            function tick(now) {
                if (!startTime) startTime = now;
                var progress = Math.min((now - startTime) / duration, 1);
                // Ease out quad
                var eased = 1 - (1 - progress) * (1 - progress);
                el.textContent = Math.floor(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target;
                }
            }
            requestAnimationFrame(tick);
        });
    }

    /* ---------- Intersection Observer for Scroll Reveals ---------- */
    function setupScrollReveals() {
        var cards = document.querySelectorAll(
            ".agent-card, .arsenal-card, .reveal-card"
        );

        if (!("IntersectionObserver" in window)) {
            // Fallback: show everything
            cards.forEach(function (c) {
                c.style.opacity = "1";
                c.style.transform = "translateY(0)";
            });
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var delayAttr = el.getAttribute("data-delay") || 0;
                        var delay = parseInt(delayAttr, 10) * 120;
                        setTimeout(function () {
                            el.style.transition =
                                "opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo)";
                            el.style.opacity = "1";
                            el.style.transform = "translateY(0)";
                        }, delay);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.15 }
        );

        cards.forEach(function (c) {
            observer.observe(c);
        });

        // Stat bar fills
        var statFills = document.querySelectorAll(".stat-fill[data-width]");
        var barObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var bar = entry.target;
                        var w = bar.getAttribute("data-width");
                        setTimeout(function () {
                            bar.style.width = w + "%";
                        }, 300);
                        barObserver.unobserve(bar);
                    }
                });
            },
            { threshold: 0.3 }
        );
        statFills.forEach(function (b) {
            barObserver.observe(b);
        });
    }

    /* ---------- Active Nav Link on Scroll ---------- */
    function setupNavHighlight() {
        var sections = document.querySelectorAll(".section");
        var navLinks = document.querySelectorAll(".nav-link");

        if (!("IntersectionObserver" in window)) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var id = entry.target.id;
                        navLinks.forEach(function (link) {
                            link.classList.remove("active");
                            if (link.getAttribute("data-section") === id) {
                                link.classList.add("active");
                            }
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        sections.forEach(function (s) {
            observer.observe(s);
        });
    }

    /* ---------- Custom Cursor ---------- */
    function setupCursor() {
        if (window.innerWidth < 769) return;

        var ring = document.createElement("div");
        ring.className = "cursor-ring";
        document.body.appendChild(ring);

        document.addEventListener("mousemove", function (e) {
            ring.classList.add("visible");
            ring.style.left = e.clientX + "px";
            ring.style.top = e.clientY + "px";
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

    /* ---------- Initialize ---------- */
    window.AnimEngine = {
        init: function () {
            runLoadSequence();
            setupScrollReveals();
            setupNavHighlight();
            setupCursor();
        },
    };
})();
