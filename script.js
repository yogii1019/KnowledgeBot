// =========================
// AI LEARNING DASHBOARD
// script.js — Upgraded v2
// =========================

document.addEventListener("DOMContentLoaded", () => {


    // =====================
    // UTILS
    // =====================

    // Safe localStorage wrapper — prevents crashes in incognito/private mode
    const store = {
        get: (key) => {
            try { return localStorage.getItem(key); }
            catch { return null; }
        },
        set: (key, val) => {
            try { localStorage.setItem(key, val); }
            catch { /* silent fail */ }
        }
    };


    // =====================
    // RIPPLE EFFECT
    // Fix: ripple is now centered on click point via transform
    // =====================
    document.querySelectorAll(".ripple-btn").forEach(button => {

        button.addEventListener("click", function (e) {

            const rect = this.getBoundingClientRect();

            const ripple = document.createElement("span");
            ripple.classList.add("ripple");

            // Center the ripple on the click point
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top  = `${e.clientY - rect.top}px`;
            // CSS should have: transform: translate(-50%, -50%) for the .ripple class
            // Adding it here as a fallback so it works even without CSS
            ripple.style.transform = "translate(-50%, -50%) scale(0)";

            this.appendChild(ripple);

            // Trigger scale animation via rAF so browser registers the initial state
            requestAnimationFrame(() => {
                ripple.style.transition = "transform 0.5s ease, opacity 0.5s ease";
                ripple.style.transform  = "translate(-50%, -50%) scale(4)";
                ripple.style.opacity    = "0";
            });

            this.style.transform = "scale(0.95)";
            setTimeout(() => { this.style.transform = ""; }, 150);
            setTimeout(() => { ripple.remove(); }, 600);

        });

    });


    // =====================
    // 3D CARD EFFECT
    // Fix: added passive: true for better scroll performance
    // =====================
    const cards = document.querySelectorAll(
        ".feature-card, .learning-card, .recommend-card"
    );

    cards.forEach(card => {

        card.addEventListener("mousemove", e => {

            const rect     = card.getBoundingClientRect();
            const x        = e.clientX - rect.left;
            const y        = e.clientY - rect.top;
            const rotateX  = -((y - rect.height / 2) / 15);
            const rotateY  =   (x - rect.width  / 2) / 15;

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-10px)
            `;

        }, { passive: true });

        card.addEventListener("mouseleave", () => {
            card.style.transition = "transform 0.4s ease";
            card.style.transform  = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
            // Clear transition after so mousemove feels instant again
            setTimeout(() => { card.style.transition = ""; }, 400);
        });

    });


    // =====================
    // PROGRESS BAR ANIMATION
    // Fix: uses data-width attribute — no more hardcoded selectors or values.
    // Usage: <div class="progress-bar" data-width="75"></div>
    // =====================
    document.querySelectorAll(".progress-bar[data-width]").forEach(bar => {

        bar.style.width      = "0%";
        bar.style.transition = "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)";

        // Use IntersectionObserver so bars only animate when visible
        const barObserver = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    const target = parseFloat(entry.target.dataset.width) || 0;
                    entry.target.style.width = `${Math.min(target, 100)}%`;
                    barObserver.unobserve(entry.target); // Animate once only
                }

            });

        }, { threshold: 0.3 });

        barObserver.observe(bar);

    });

    // Backward-compat shim for old .java / .bio class approach
    // Remove these once HTML is updated to use data-width
    const legacyBars = {
        ".java": 60,
        ".bio" : 40,
    };

    Object.entries(legacyBars).forEach(([sel, pct]) => {
        const el = document.querySelector(sel);
        if (el && !el.dataset.width) {
            el.style.transition = "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
            el.style.width = "0%";
            setTimeout(() => { el.style.width = `${pct}%`; }, 500);
        }
    });


    // =====================
    // FLOAT PARTICLES
    // Fix: smooth animation via CSS keyframes injected once.
    //      No setInterval, no jitter, checks existence first.
    // =====================
    const particles = document.querySelectorAll(".particle");

    if (particles.length > 0) {

        // Inject keyframe animation once into the document
        if (!document.getElementById("particle-style")) {
            const style = document.createElement("style");
            style.id = "particle-style";
            style.textContent = `
                @keyframes floatParticle {
                    0%   { transform: translateY(0px)   translateX(0px)   opacity: 1; }
                    50%  { transform: translateY(-18px) translateX(6px);  opacity: 0.7; }
                    100% { transform: translateY(0px)   translateX(0px);  opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        particles.forEach((p, i) => {
            // Stagger each particle's animation so they don't all move together
            const duration = 2.5 + (i % 4) * 0.7; // 2.5s – 4.6s
            const delay    = (i % 5) * 0.4;         // 0s   – 1.6s
            p.style.animation = `floatParticle ${duration}s ${delay}s ease-in-out infinite`;
        });

    }


    // =====================
    // THEMES
    // Fix: renamed CSS vars to --primary / --secondary for clarity.
    //      Make sure your CSS uses var(--primary) and var(--secondary).
    // =====================
   const themes = {
    purple: {
        main: "#8b5cf6",
        second: "#4f8cff"
    },

    blue: {
        main: "#3b82f6",
        second: "#06b6d4"
    },

    pink: {
        main: "#ec4899",
        second: "#a855f7"
    },

    green: {
        main: "#10b981",
        second: "#14b8a6"
    },

    orange: {
        main: "#f59e0b",
        second: "#fb7185"
    }
};

    function applyTheme(color1, color2) {
        const root = document.documentElement;
        root.style.setProperty("--primary",   color1);
        root.style.setProperty("--secondary", color2);

        // Keep backward compat if CSS still uses --purple / --blue
        root.style.setProperty("--purple", color1);
        root.style.setProperty("--blue",   color2);
    }

    // Load saved theme on page start
    const savedTheme = store.get("theme");
    if (savedTheme && themes[savedTheme]) {
        applyTheme(themes[savedTheme].main, themes[savedTheme].second);
    }

    // Theme switcher buttons
    document.querySelectorAll(".theme-color").forEach(btn => {

        btn.addEventListener("click", () => {

            const name = btn.dataset.theme;
            if (!name || !themes[name]) return;

            applyTheme(themes[name].main, themes[name].second);
            store.set("theme", name);

            // Visual feedback: mark active button
            document.querySelectorAll(".theme-color").forEach(b =>
                b.classList.remove("active-theme")
            );
            btn.classList.add("active-theme");

        });

    });


    // =====================
    // DARK MODE
    // Fix: safe localStorage, icon swap, proper toggle state
    // =====================
    const darkButton = document.querySelector(".dark-theme");

    if (darkButton) {

        const updateIcon = (isDark) => {
            darkButton.textContent = isDark ? "☀️" : "🌙";
            darkButton.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        };

        const isDark = store.get("darkMode") === "true";
        if (isDark) document.body.classList.add("dark-mode");
        updateIcon(isDark);

        darkButton.addEventListener("click", () => {
            const nowDark = document.body.classList.toggle("dark-mode");
            store.set("darkMode", nowDark);
            updateIcon(nowDark);
        });

    }


    // =====================
    // SCROLL REVEAL
    // No changes needed — this was correct. Minor: threshold bump for earlier trigger.
    // =====================
    const revealObserver = new IntersectionObserver(

        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show-card");
                    revealObserver.unobserve(entry.target); // Stop observing once shown
                }
            });
        },

        { threshold: 0.1 } // 0.1 is more forgiving on smaller screens than 0.15
    );

    document.querySelectorAll(
        ".feature-card, .learning-card, .recommend-card"
    ).forEach(el => revealObserver.observe(el));


});