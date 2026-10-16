

document.addEventListener("DOMContentLoaded", function () {

    // Mobile navigation
    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            const isOpen = nav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.textContent = isOpen ? "Close ✕" : "Menu ☰";
        });
    }

    // Current year
    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Current page navigation highlight
    const currentPage = decodeURIComponent(
        window.location.pathname.split("/").pop()
    );

    document.querySelectorAll(".site-nav a").forEach(function (link) {
        const linkPage = decodeURIComponent(
            link.getAttribute("href").split("/").pop()
        );

        if (linkPage === currentPage) {
            link.setAttribute("aria-current", "page");
        }
    });

    // Product search and category filtering
    const search = document.getElementById("productSearch");
    const category = document.getElementById("productCategory");
    const products = document.querySelectorAll(".product-card");
    const count = document.getElementById("productCount");
    const empty = document.getElementById("noProducts");

    function filterProducts() {
        if (!products.length) return;

        const query = search ? search.value.trim().toLowerCase() : "";
        const selected = category ? category.value : "all";
        let visible = 0;

        products.forEach(function (product) {
            const name = product.dataset.name || "";
            const text = product.textContent.toLowerCase();

            const matchesSearch =
                name.toLowerCase().includes(query) ||
                text.includes(query);

            const matchesCategory =
                selected === "all" ||
                product.dataset.category === selected;

            const show = matchesSearch && matchesCategory;

            product.classList.toggle("hidden", !show);

            if (show) visible++;
        });

        if (count) {
            count.textContent =
                visible + " product" + (visible === 1 ? "" : "s") + " found";
        }

        if (empty) {
            empty.classList.toggle("hidden", visible !== 0);
        }
    }

    if (search) {
        search.addEventListener("input", filterProducts);
    }

    if (category) {
        category.addEventListener("change", filterProducts);
    }

    filterProducts();

    // FAQ accordion
    document.querySelectorAll(".faq-question").forEach(function (button) {
        button.addEventListener("click", function () {
            const panelId = button.getAttribute("aria-controls");
            const panel = document.getElementById(panelId);

            const expanded =
                button.getAttribute("aria-expanded") === "true";

            button.setAttribute("aria-expanded", String(!expanded));

            if (panel) {
                panel.hidden = expanded;
            }

            const indicator = button.querySelector(".faq-indicator");

            if (indicator) {
                indicator.textContent = expanded ? "+" : "−";
            }
        });
    });

    // Service tabs
    document.querySelectorAll("[data-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
            const group = button.closest("[data-tabs]");

            if (!group) return;

            group.querySelectorAll("[data-tab]").forEach(function (tab) {
                tab.setAttribute(
                    "aria-selected",
                    String(tab === button)
                );
            });

            group.querySelectorAll("[data-panel]").forEach(function (panel) {
                panel.hidden = panel.dataset.panel !== button.dataset.tab;
            });
        });
    });

    // Gallery lightbox
    const lightbox = document.getElementById("lightbox");

    document.querySelectorAll("[data-gallery-item]").forEach(function (item) {
        item.addEventListener("click", function () {
            if (!lightbox) return;

            const visual = lightbox.querySelector(".lightbox-visual");
            const caption = lightbox.querySelector(".lightbox-caption");
            const closeButton = lightbox.querySelector(".lightbox-close");

            if (visual) {
                visual.textContent = item.dataset.visual || "🥬";
            }

            if (caption) {
                caption.textContent =
                    item.dataset.caption || "EcoFresh Grocers";
            }

            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            if (closeButton) closeButton.focus();
        });
    });

    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (lightbox) {
        const closeButton = lightbox.querySelector(".lightbox-close");

        if (closeButton) {
            closeButton.addEventListener("click", closeLightbox);
        }

        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });

    // Form validation
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const status = form.querySelector("[data-form-status]");
            let valid = true;

            form.querySelectorAll(".field-error").forEach(function (error) {
                error.textContent = "";
            });

            form.querySelectorAll("[required]").forEach(function (field) {
                const error = form.querySelector(
                    '[data-error-for="' + field.id + '"]'
                );

                let message = "";

                if (field.type === "checkbox" && !field.checked) {
                    message = "Please confirm this checkbox.";
                } else if (!field.value.trim()) {
                    message = "This field is required.";
                } else if (
                    field.type === "email" &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
                ) {
                    message = "Please enter a valid email address.";
                } else if (
                    field.type === "tel" &&
                    !/^[+()\d\s-]{7,20}$/.test(field.value.trim())
                ) {
                    message = "Please enter a valid telephone number.";
                } else if (
                    field.minLength > 0 &&
                    field.value.trim().length < field.minLength
                ) {
                    message =
                        "Please enter at least " +
                        field.minLength +
                        " characters.";
                }

                if (error) {
                    error.textContent = message;
                }

                field.setAttribute("aria-invalid", String(Boolean(message)));

                if (message) {
                    valid = false;
                }
            });

            if (!valid) {
                if (status) {
                    status.className = "notice error";
                    status.textContent =
                        "Please correct the highlighted fields and try again.";
                }

                const firstInvalid = form.querySelector(
                    '[aria-invalid="true"]'
                );

                if (firstInvalid) {
                    firstInvalid.focus();
                }

                return;
            }

            const data = Object.fromEntries(
                new FormData(form).entries()
            );

            if (status) {
                status.className = "notice success";

                if (form.dataset.formType === "enquiry") {
                    status.textContent =
                        "Thank you, " + (data.name || "customer") +
                        "! Your enquiry has been validated. This demonstration " +
                        "website does not send or store form submissions online.";
                } else {
                    status.textContent =
                        "Thank you, " + (data.name || "customer") +
                        "! Your message has been validated. Connect an email " +
                        "service or backend to send messages automatically.";
                }
            }

            form.reset();

            form.querySelectorAll("[aria-invalid]").forEach(function (field) {
                field.removeAttribute("aria-invalid");
            });
        });
    });

    // Back-to-top button
    const topButton = document.querySelector(".back-top");

    if (topButton) {
        function updateTopButton() {
            topButton.classList.toggle("show", window.scrollY > 450);
        }

        window.addEventListener("scroll", updateTopButton, {
            passive: true
        });

        updateTopButton();

        topButton.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

});
