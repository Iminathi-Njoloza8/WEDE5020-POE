

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

   
    // Image lightbox for all website pictures

    let currentImageIndex = 0;
    let galleryImages = [];
    let previousFocusedElement = null;

    // Create the lightbox automatically
    const lightbox = document.createElement("div");

    lightbox.id = "image-lightbox";
    lightbox.className = "image-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.setAttribute("aria-hidden", "true");

    lightbox.innerHTML = `
        <div class="image-lightbox-content">

            <button type="button"
                    class="lightbox-close"
                    aria-label="Close image viewer">
                &times;
            </button>

            <button type="button"
                    class="lightbox-prev"
                    aria-label="Previous image">
                &#10094;
            </button>

            <img class="lightbox-image"
                 src=""
                 alt="">

            <button type="button"
                    class="lightbox-next"
                    aria-label="Next image">
                &#10095;
            </button>

            <p class="lightbox-caption"></p>

        </div>
    `;

    document.body.appendChild(lightbox);

    // Get lightbox elements
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const lightboxCaption = lightbox.querySelector(".lightbox-caption");
    const closeButton = lightbox.querySelector(".lightbox-close");
    const previousButton = lightbox.querySelector(".lightbox-prev");
    const nextButton = lightbox.querySelector(".lightbox-next");

    // Add lightbox styling
    const lightboxStyles = document.createElement("style");

    lightboxStyles.textContent = `
        .image-lightbox {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: rgba(0, 0, 0, 0.93);
            justify-content: center;
            align-items: center;
            padding: 25px;
        }

        .image-lightbox.open {
            display: flex;
        }

        .image-lightbox-content {
            position: relative;
            width: 100%;
            max-width: 1000px;
            text-align: center;
        }

        .lightbox-image {
            display: block;
            max-width: 100%;
            max-height: 78vh;
            width: auto;
            height: auto;
            margin: auto;
            object-fit: contain;
            border-radius: 10px;
        }

        .lightbox-caption {
            color: white;
            font-size: 16px;
            margin-top: 15px;
        }

        .image-lightbox button {
            position: absolute;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background 0.3s ease;
        }

        .image-lightbox button:hover {
            background: #398343;
        }

        .lightbox-close {
            top: -45px;
            right: 0;
            width: 42px;
            height: 42px;
            font-size: 28px;
        }

        .lightbox-prev,
        .lightbox-next {
            top: 50%;
            width: 45px;
            height: 45px;
            font-size: 25px;
            transform: translateY(-50%);
        }

        .lightbox-prev {
            left: -60px;
        }

        .lightbox-next {
            right: -60px;
        }

        main img:not([data-no-lightbox]):not(.no-lightbox) {
            cursor: zoom-in;
        }

        @media (max-width: 600px) {
            .lightbox-prev {
                left: 5px;
            }

            .lightbox-next {
                right: 5px;
            }

            .lightbox-image {
                max-height: 65vh;
            }

            .lightbox-close {
                right: 5px;
                top: -50px;
            }
        }
    `;

    document.head.appendChild(lightboxStyles);

    // Find all pictures on the website
    function getGalleryImages() {
        return Array.from(
            document.querySelectorAll("img")
        ).filter(function (image) {
            return !image.closest("#image-lightbox") &&
                   !image.classList.contains("no-lightbox") &&
                   image.dataset.noLightbox !== "true";
        });
    }

    // Display the selected picture
    function showLightboxImage(index) {

        if (galleryImages.length === 0) return;

        currentImageIndex =
            (index + galleryImages.length) % galleryImages.length;

        const selectedImage = galleryImages[currentImageIndex];

        lightboxImage.src =
            selectedImage.currentSrc || selectedImage.src;

        lightboxImage.alt =
            selectedImage.alt || "EcoFresh Grocers picture";

        lightboxCaption.textContent =
            selectedImage.dataset.caption ||
            selectedImage.alt ||
            "EcoFresh Grocers";
    }

    // Open the lightbox
    function openLightbox(image) {

        galleryImages = getGalleryImages();

        currentImageIndex = galleryImages.indexOf(image);

        if (currentImageIndex === -1) return;

        previousFocusedElement = document.activeElement;

        showLightboxImage(currentImageIndex);

        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        closeButton.focus();
    }

    // Close the lightbox
    function closeLightbox() {

        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        lightboxImage.src = "";

        if (previousFocusedElement) {
            previousFocusedElement.focus();
        }
    }

    // Allow users to click any picture to open it
    document.addEventListener("click", function (event) {

        const image = event.target.closest("img");

        if (!image) return;

        if (
            image.closest("#image-lightbox") ||
            image.classList.contains("no-lightbox") ||
            image.dataset.noLightbox === "true"
        ) {
            return;
        }

        // Prevent a linked picture from navigating away
        event.preventDefault();

        openLightbox(image);
    });

    // Previous picture
    previousButton.addEventListener("click", function () {
        showLightboxImage(currentImageIndex - 1);
    });

    // Next picture
    nextButton.addEventListener("click", function () {
        showLightboxImage(currentImageIndex + 1);
    });

    // Close button
    closeButton.addEventListener("click", closeLightbox);

    // Close when clicking outside the picture
    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {
            closeLightbox();
        }

    });

    // Keyboard controls
    document.addEventListener("keydown", function (event) {

        if (!lightbox.classList.contains("open")) return;

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowRight") {
            showLightboxImage(currentImageIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            showLightboxImage(currentImageIndex - 1);
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
