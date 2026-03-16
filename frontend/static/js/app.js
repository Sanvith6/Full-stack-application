/* ============================================
   VANGUARD PROTOCOL — ELITE Application Logic
   API calls, rendering, agent modal, forms, toast
   ============================================ */

(function () {
    "use strict";

    var API_BASE = window.location.origin + "/api";

    /* ========== HELPERS ========== */
    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function showToast(message) {
        var container = document.getElementById("toast-container");
        if (!container) return;
        var toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(function () {
            toast.classList.add("show");
        });
        setTimeout(function () {
            toast.classList.remove("show");
            setTimeout(function () { toast.remove(); }, 500);
        }, 3000);
    }

    /* ========== API CALLS ========== */
    function fetchHealth() {
        fetch(API_BASE + "/health")
            .then(function (res) { return res.json(); })
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

    var cachedAgents = [];

    function fetchAgents() {
        fetch(API_BASE + "/agents")
            .then(function (res) { return res.json(); })
            .then(function (agents) {
                cachedAgents = agents;
                renderAgents(agents);
            })
            .catch(function () {
                showToast("Failed to load agents");
            });
    }

    function fetchMessages() {
        fetch(API_BASE + "/messages")
            .then(function (res) { return res.json(); })
            .then(function (messages) {
                renderMessages(messages);
            })
            .catch(function () { /* silently fail */ });
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
                showToast("Transmission sent");
            })
            .catch(function () {
                showToast("Transmission failed");
            });
    }

    /* ========== RENDER AGENTS ========== */
    function renderAgents(agents) {
        var grid = document.getElementById("agents-grid");
        if (!grid) return;
        grid.innerHTML = "";

        agents.forEach(function (agent, index) {
            var card = document.createElement("div");
            card.className = "agent-card";
            card.setAttribute("data-delay", index);

            var initial = agent.name.charAt(0);

            var abilitiesHtml = agent.abilities.map(function (a) {
                return '<span class="ability-tag">' + escapeHtml(a) + '</span>';
            }).join("");

            var diffBars = "";
            for (var i = 1; i <= 3; i++) {
                diffBars += '<div class="diff-bar' + (i <= agent.difficulty ? " filled" : "") + '"></div>';
            }

            card.innerHTML =
                '<div class="agent-card-glow"></div>' +
                '<div class="agent-card-top">' +
                    '<div class="agent-card-header">' +
                        '<div class="agent-avatar">' +
                            '<div class="agent-avatar-hex">' +
                                '<svg viewBox="0 0 52 52"><polygon points="26,2 48,15 48,37 26,50 4,37 4,15" fill="#ff465510" stroke="#ff465540" stroke-width="1"/></svg>' +
                            '</div>' +
                            '<span class="agent-avatar-letter">' + escapeHtml(initial) + '</span>' +
                        '</div>' +
                        '<span class="agent-role-badge">' + escapeHtml(agent.role) + '</span>' +
                    '</div>' +
                    '<h3 class="agent-name">' + escapeHtml(agent.name) + '</h3>' +
                    '<p class="agent-origin">' + escapeHtml(agent.origin) + '</p>' +
                '</div>' +
                '<div class="agent-card-bottom">' +
                    '<div class="agent-abilities">' + abilitiesHtml + '</div>' +
                    '<div class="agent-difficulty">' +
                        '<span class="agent-difficulty-label">DIFFICULTY</span>' +
                        '<div class="difficulty-bars">' + diffBars + '</div>' +
                    '</div>' +
                    '<button class="agent-view-btn" data-agent-index="' + index + '">' +
                        'VIEW DETAIL' +
                        '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                    '</button>' +
                '</div>';

            grid.appendChild(card);
        });

        // Re-observe for scroll animations
        observeAgentCards();
    }

    function observeAgentCards() {
        var cards = document.querySelectorAll(".agent-card");
        if (!("IntersectionObserver" in window)) {
            cards.forEach(function (c) {
                c.style.opacity = "1";
                c.style.transform = "none";
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var d = parseInt(el.getAttribute("data-delay") || "0", 10) * 120;
                    setTimeout(function () {
                        el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)";
                        el.style.opacity = "1";
                        el.style.transform = "translateY(0) scale(1)";
                    }, d);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(function (c) { observer.observe(c); });

        // Setup tilt for new cards
        setTimeout(function () {
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
        }, 500);
    }

    /* ========== AGENT DETAIL MODAL ========== */
    function openAgentModal(agent) {
        var modal = document.getElementById("agent-modal");
        var body = document.getElementById("modal-body");
        if (!modal || !body) return;

        var abilitiesList = agent.abilities.map(function (a, i) {
            return '<div class="modal-ability">' +
                '<span class="modal-ability-index">0' + (i + 1) + '</span>' +
                '<span class="modal-ability-name">' + escapeHtml(a) + '</span>' +
            '</div>';
        }).join("");

        var diffBars = "";
        for (var i = 1; i <= 3; i++) {
            diffBars += '<div class="modal-diff-bar' + (i <= agent.difficulty ? " filled" : "") + '"></div>';
        }

        body.innerHTML =
            '<div class="modal-agent-header">' +
                '<div class="modal-agent-role">' + escapeHtml(agent.role) + '</div>' +
                '<h2 class="modal-agent-name">' + escapeHtml(agent.name) + '</h2>' +
                '<p class="modal-agent-origin">' + escapeHtml(agent.origin) + '</p>' +
            '</div>' +
            '<div class="modal-section-title">// ABILITIES</div>' +
            '<div class="modal-abilities-list">' + abilitiesList + '</div>' +
            '<div class="modal-difficulty">' +
                '<span class="modal-diff-label">DIFFICULTY</span>' +
                '<div class="modal-diff-bars">' + diffBars + '</div>' +
            '</div>';

        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeAgentModal() {
        var modal = document.getElementById("agent-modal");
        if (modal) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }
    }

    /* ========== RENDER MESSAGES ========== */
    function renderMessages(messages) {
        var feed = document.getElementById("comms-feed");
        if (!feed) return;

        if (!messages || messages.length === 0) {
            feed.innerHTML =
                '<div class="comms-empty">' +
                    '<div class="comms-empty-icon">' +
                        '<svg viewBox="0 0 60 60" width="60" height="60">' +
                            '<circle cx="30" cy="30" r="25" fill="none" stroke="#53514d" stroke-width="1" stroke-dasharray="4 4"/>' +
                            '<path d="M20 25h20M20 30h14M20 35h18" stroke="#53514d40" stroke-width="1.5" stroke-linecap="round"/>' +
                        '</svg>' +
                    '</div>' +
                    '<p>No transmissions yet. Be the first to open comms.</p>' +
                '</div>';
            return;
        }

        feed.innerHTML = "";
        messages.forEach(function (msg) {
            var div = document.createElement("div");
            div.className = "comms-message";

            var time = "";
            if (msg.timestamp) {
                var d = new Date(msg.timestamp);
                time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }

            div.innerHTML =
                '<div class="comms-msg-header">' +
                    '<span class="comms-author">' + escapeHtml(msg.author || "UNKNOWN") + '</span>' +
                    '<span class="comms-time">' + escapeHtml(time) + '</span>' +
                '</div>' +
                '<p class="comms-text">' + escapeHtml(msg.text) + '</p>';

            feed.appendChild(div);
        });

        feed.scrollTop = feed.scrollHeight;
    }

    /* ========== FORM HANDLING ========== */
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

    /* ========== EVENT DELEGATION ========== */
    function setupEventDelegation() {
        // Agent view buttons and card clicks
        document.addEventListener("click", function (e) {
            var viewBtn = e.target.closest(".agent-view-btn");
            if (viewBtn) {
                var index = parseInt(viewBtn.getAttribute("data-agent-index"), 10);
                if (cachedAgents[index]) {
                    openAgentModal(cachedAgents[index]);
                }
                return;
            }

            // Card click (on the card itself but not the button)
            var card = e.target.closest(".agent-card");
            if (card && !e.target.closest(".agent-view-btn")) {
                var cardIndex = Array.from(card.parentElement.children).indexOf(card);
                if (cachedAgents[cardIndex]) {
                    openAgentModal(cachedAgents[cardIndex]);
                }
                return;
            }
        });

        // Modal close
        var closeBtn = document.getElementById("modal-close");
        var backdrop = document.getElementById("modal-backdrop");
        if (closeBtn) closeBtn.addEventListener("click", closeAgentModal);
        if (backdrop) backdrop.addEventListener("click", closeAgentModal);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeAgentModal();
        });

        // Hero CTA buttons
        var btnExplore = document.getElementById("btn-explore");
        var btnComms = document.getElementById("btn-comms");
        if (btnExplore) {
            btnExplore.addEventListener("click", function () {
                var el = document.getElementById("agents");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
        if (btnComms) {
            btnComms.addEventListener("click", function () {
                var el = document.getElementById("comms");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    }

    /* ========== BOOT ========== */
    document.addEventListener("DOMContentLoaded", function () {
        // Start animation engine (loading sequence + reveals)
        if (window.AnimEngine) {
            window.AnimEngine.init();
        }

        // Fetch data
        fetchHealth();
        fetchAgents();
        fetchMessages();

        // Setup UI
        setupForm();
        setupEventDelegation();

        // Refresh messages periodically
        setInterval(fetchMessages, 10000);
    });
})();
