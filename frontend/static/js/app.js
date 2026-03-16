/* ============================================
   VANGUARD PROTOCOL — Main Application Logic
   API calls, rendering, form handling
   ============================================ */

(function () {
    "use strict";

    var API_BASE = window.location.origin + "/api";

    /* ---------- Helpers ---------- */
    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function showToast(message) {
        var existing = document.querySelector(".toast");
        if (existing) existing.remove();

        var toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        setTimeout(function () {
            toast.classList.remove("show");
            setTimeout(function () {
                toast.remove();
            }, 400);
        }, 3000);
    }

    /* ---------- API Calls ---------- */
    function fetchHealth() {
        fetch(API_BASE + "/health")
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                var statusEl = document.getElementById("server-status");
                var dot = document.querySelector(".status-dot");
                if (data.status === "online") {
                    if (statusEl) statusEl.textContent = "ONLINE";
                    if (dot) dot.classList.add("online");
                }
            })
            .catch(function () {
                var statusEl = document.getElementById("server-status");
                if (statusEl) statusEl.textContent = "OFFLINE";
            });
    }

    function fetchAgents() {
        fetch(API_BASE + "/agents")
            .then(function (res) {
                return res.json();
            })
            .then(function (agents) {
                renderAgents(agents);
            })
            .catch(function () {
                showToast("Failed to load agents");
            });
    }

    function fetchMessages() {
        fetch(API_BASE + "/messages")
            .then(function (res) {
                return res.json();
            })
            .then(function (messages) {
                renderMessages(messages);
            })
            .catch(function () {
                /* silently fail */
            });
    }

    function postMessage(author, text) {
        fetch(API_BASE + "/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ author: author, text: text }),
        })
            .then(function (res) {
                if (!res.ok) throw new Error("Failed");
                return res.json();
            })
            .then(function () {
                fetchMessages();
                showToast("Transmission sent successfully");
            })
            .catch(function () {
                showToast("Transmission failed");
            });
    }

    /* ---------- Rendering ---------- */
    function renderAgents(agents) {
        var grid = document.getElementById("agents-grid");
        if (!grid) return;

        grid.innerHTML = "";

        agents.forEach(function (agent, index) {
            var card = document.createElement("div");
            card.className = "agent-card";
            card.setAttribute("data-delay", index);

            var initials = agent.name.charAt(0);

            var abilitiesHtml = agent.abilities
                .map(function (a) {
                    return '<span class="ability-tag">' + escapeHtml(a) + "</span>";
                })
                .join("");

            var diffBars = "";
            for (var i = 1; i <= 3; i++) {
                diffBars +=
                    '<div class="diff-bar' +
                    (i <= agent.difficulty ? " filled" : "") +
                    '"></div>';
            }

            card.innerHTML =
                '<div class="agent-card-header">' +
                '<div class="agent-avatar">' +
                escapeHtml(initials) +
                "</div>" +
                '<span class="agent-role-badge">' +
                escapeHtml(agent.role) +
                "</span>" +
                "</div>" +
                '<h3 class="agent-name">' +
                escapeHtml(agent.name) +
                "</h3>" +
                '<p class="agent-origin">' +
                escapeHtml(agent.origin) +
                "</p>" +
                '<div class="agent-abilities">' +
                abilitiesHtml +
                "</div>" +
                '<div class="agent-difficulty">' +
                "<span>DIFFICULTY</span>" +
                '<div class="difficulty-bars">' +
                diffBars +
                "</div>" +
                "</div>";

            grid.appendChild(card);
        });

        // Re-trigger scroll observer for new cards
        if (window.AnimEngine) {
            var cards = grid.querySelectorAll(".agent-card");
            if ("IntersectionObserver" in window) {
                var observer = new IntersectionObserver(
                    function (entries) {
                        entries.forEach(function (entry) {
                            if (entry.isIntersecting) {
                                var el = entry.target;
                                var d =
                                    parseInt(
                                        el.getAttribute("data-delay") || 0,
                                        10
                                    ) * 120;
                                setTimeout(function () {
                                    el.style.transition =
                                        "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
                                    el.style.opacity = "1";
                                    el.style.transform = "translateY(0)";
                                }, d);
                                observer.unobserve(el);
                            }
                        });
                    },
                    { threshold: 0.15 }
                );
                cards.forEach(function (c) {
                    observer.observe(c);
                });
            }
        }
    }

    function renderMessages(messages) {
        var feed = document.getElementById("comms-feed");
        if (!feed) return;

        if (!messages || messages.length === 0) {
            feed.innerHTML =
                '<div class="comms-empty">' +
                '<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="20" fill="none" stroke="var(--text-dim)" stroke-width="1" stroke-dasharray="4 4"/><text x="24" y="28" text-anchor="middle" fill="var(--text-dim)" font-size="16">?</text></svg>' +
                "<p>No transmissions yet. Be the first to send a message.</p>" +
                "</div>";
            return;
        }

        feed.innerHTML = "";
        messages.forEach(function (msg) {
            var div = document.createElement("div");
            div.className = "comms-message";

            var time = "";
            if (msg.timestamp) {
                var d = new Date(msg.timestamp);
                time = d.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }

            div.innerHTML =
                '<div class="comms-msg-header">' +
                '<span class="comms-author">' +
                escapeHtml(msg.author || "UNKNOWN") +
                "</span>" +
                '<span class="comms-time">' +
                escapeHtml(time) +
                "</span>" +
                "</div>" +
                '<p class="comms-text">' +
                escapeHtml(msg.text) +
                "</p>";

            feed.appendChild(div);
        });

        // Scroll to bottom
        feed.scrollTop = feed.scrollHeight;
    }

    /* ---------- Form Handling ---------- */
    function setupForm() {
        var form = document.getElementById("comms-form");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var authorInput = document.getElementById("author-input");
            var messageInput = document.getElementById("message-input");

            var author = (authorInput.value || "").trim() || "Anonymous";
            var text = (messageInput.value || "").trim();

            if (!text) {
                showToast("Message cannot be empty");
                return;
            }

            postMessage(author, text);
            messageInput.value = "";
        });
    }

    /* ---------- Smooth Scroll ---------- */
    window.scrollToSection = function (id) {
        var el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    /* ---------- Boot ---------- */
    document.addEventListener("DOMContentLoaded", function () {
        // Initialize animation engine
        if (window.AnimEngine) {
            window.AnimEngine.init();
        }

        // Fetch data
        fetchHealth();
        fetchAgents();
        fetchMessages();

        // Setup form
        setupForm();

        // Refresh messages periodically
        setInterval(fetchMessages, 10000);
    });
})();
