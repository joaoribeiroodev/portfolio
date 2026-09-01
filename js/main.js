(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ---------------------------------------------------------------
       Ano do rodapé
       --------------------------------------------------------------- */
    const yearEl = document.querySelector("[data-year]");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------------
       Scrollspy: destaca o link ativo na topnav e alimenta a trilha
       lateral com o progresso de leitura, seção por seção.
       --------------------------------------------------------------- */
    const sections = Array.from(document.querySelectorAll("main > section[id]"));
    const navLinks = Array.from(document.querySelectorAll(".topnav__links a"));
    const railFill = document.querySelector(".rail__fill");

    const linkForSection = (id) =>
        navLinks.find((link) => link.getAttribute("href") === `#${id}`);

    function setActiveLink(id) {
        navLinks.forEach((link) => link.classList.remove("is-active"));
        const active = linkForSection(id);
        if (active) active.classList.add("is-active");
    }

    if (sections.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveLink(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-45% 0px -50% 0px",
                threshold: 0,
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    function updateRail() {
        if (!railFill) return;
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const height = doc.scrollHeight - doc.clientHeight;
        const ratio = height > 0 ? Math.min(scrollTop / height, 1) : 0;
        railFill.style.height = `${ratio * 100}%`;
    }

    window.addEventListener("scroll", updateRail, { passive: true });
    window.addEventListener("resize", updateRail);
    updateRail();

    /* ---------------------------------------------------------------
       Status line: digita a sequência da trajetória profissional
       (suporte técnico → infraestrutura → redes → cybersecurity).
       Roda uma única vez, ao carregar a página.
       --------------------------------------------------------------- */
    const statusLine = document.querySelector(".status-line");
    const statusText = document.querySelector("[data-typed]");

    if (statusText && statusLine) {
        const steps = (statusText.dataset.sequence || statusText.textContent)
            .split("→")
            .map((step) => step.trim())
            .filter(Boolean);

        if (prefersReducedMotion || steps.length < 2) {
            statusText.textContent = steps[steps.length - 1] || statusText.textContent;
            statusLine.classList.add("is-done");
        } else {
            typeSequence(statusText, statusLine, steps);
        }
    }

    function typeSequence(el, wrapper, steps) {
        const TYPE_SPEED = 42;
        const DELETE_SPEED = 24;
        const HOLD_TIME = 650;

        let stepIndex = 0;
        let charIndex = 0;
        let deleting = false;

        el.textContent = "";

        function tick() {
            const current = steps[stepIndex];
            const isLast = stepIndex === steps.length - 1;

            if (!deleting) {
                charIndex += 1;
                el.textContent = current.slice(0, charIndex);

                if (charIndex === current.length) {
                    if (isLast) {
                        wrapper.classList.add("is-done");
                        return;
                    }
                    window.setTimeout(() => {
                        deleting = true;
                        tick();
                    }, HOLD_TIME);
                    return;
                }
            } else {
                charIndex -= 1;
                el.textContent = current.slice(0, charIndex);

                if (charIndex === 0) {
                    deleting = false;
                    stepIndex += 1;
                }
            }

            window.setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
        }

        window.setTimeout(tick, 300);
    }

    /* ---------------------------------------------------------------
       Alternância de tema claro/escuro
       --------------------------------------------------------------- */
    const THEME_KEY = "jpr-theme";
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");

    if (themeToggle) {
        themeToggle.setAttribute(
            "aria-pressed",
            String(root.getAttribute("data-theme") === "light")
        );

        themeToggle.addEventListener("click", () => {
            const isLight = root.getAttribute("data-theme") === "light";

            if (isLight) {
                root.removeAttribute("data-theme");
                window.localStorage.setItem(THEME_KEY, "dark");
                themeToggle.setAttribute("aria-pressed", "false");
            } else {
                root.setAttribute("data-theme", "light");
                window.localStorage.setItem(THEME_KEY, "light");
                themeToggle.setAttribute("aria-pressed", "true");
            }
        });
    }

    /* ---------------------------------------------------------------
       Copiar e-mail para a área de transferência
       --------------------------------------------------------------- */
    document.querySelectorAll(".copy-btn[data-copy]").forEach((button) => {
        const originalLabel = button.textContent;

        button.addEventListener("click", async () => {
            const value = button.dataset.copy;

            try {
                await navigator.clipboard.writeText(value);
            } catch (err) {
                const helper = document.createElement("textarea");
                helper.value = value;
                helper.style.position = "fixed";
                helper.style.opacity = "0";
                document.body.appendChild(helper);
                helper.select();
                document.execCommand("copy");
                document.body.removeChild(helper);
            }

            button.textContent = "Copiado!";
            button.classList.add("is-copied");

            window.setTimeout(() => {
                button.textContent = originalLabel;
                button.classList.remove("is-copied");
            }, 1800);
        });
    });
})();
