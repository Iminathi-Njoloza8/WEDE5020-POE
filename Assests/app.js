

document.addEventListener("DOMContentLoaded", function () {

    // Mobile navigation
    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            const isOpen = nav.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.textContent = isOpen ? "Close" : "Menu";
        });
    }

    // Automatically update the footer year
    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Highlight the current page in the navigation
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

    // Live product search and category filtering
    const search = document.getElementById("productSearch");
    const category = document.getElementById("productCategory");
    const products = Array.from(
        document.querySelectorAll(".product-card")
    );

    const count = document.getElementById("productCount");
    const empty = document.getElementById("noProducts");

    function filterProducts() {
        if (!products.length) return;

        const query = search
            ? search.value.trim().toLocaleLowerCase()
            : "";

        const selected = category ? category.value : "all";

        let visible = 0;

        products.forEach(function (product) {

            const searchableText = (
                (product.dataset.name || "") + " " + product.textContent
            ).toLocaleLowerCase();

            const matchesSearch = searchableText.includes(query);

            const matchesCategory =
                selected === "all" ||
                product.dataset.category === selected;

            const show = matchesSearch && matchesCategory;

            product.classList.toggle("hidden", !show);

            product.setAttribute(
                "aria-hidden",
                String(!show)
            );

            if (show) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent =
                visible + " of " + products.length + " products shown";
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

            const panel = document.getElementById(
                button.getAttribute("aria-controls")
            );

            const expanded =
                button.getAttribute("aria-expanded") === "true";

            button.setAttribute(
                "aria-expanded",
                String(!expanded)
            );

            if (panel) {
                panel.hidden = expanded;
            }

            const indicator = button.querySelector(".faq-indicator");

            if (indicator) {
                indicator.textContent = expanded ? "+" : "−";
            }
        });
    });

    // Accessible service tabs
    document.querySelectorAll("[data-tabs]").forEach(function (group, groupIndex) {

        const tabButtons = Array.from(
            group.querySelectorAll("[data-tab]")
        );

        const panels = Array.from(
            group.querySelectorAll("[data-panel]")
        );

        tabButtons.forEach(function (button, index) {

            const panel = panels.find(function (item) {
                return item.dataset.panel === button.dataset.tab;
            });

            if (panel) {

                if (!panel.id) {
                    panel.id =
                        "service-panel-" + groupIndex + "-" + index;
                }

                button.setAttribute("aria-controls", panel.id);

                panel.setAttribute(
                    "aria-labelledby",
                    button.id ||
                    (button.id = "service-tab-" + groupIndex + "-" + index)
                );
            }

            button.addEventListener("click", function () {

                tabButtons.forEach(function (tab) {

                    const active = tab === button;

                    tab.setAttribute(
                        "aria-selected",
                        String(active)
                    );

                    tab.setAttribute(
                        "tabindex",
                        active ? "0" : "-1"
                    );
                });

                panels.forEach(function (item) {
                    item.hidden =
                        item.dataset.panel !== button.dataset.tab;
                });
            });
        });
    });

    // Site-wide image lightbox
    // Images inside main content can be opened by mouse or keyboard.
    const images = Array.from(
        document.querySelectorAll("main img:not(.no-lightbox)")
    ).filter(function (image) {
        return !image.closest("a");
    });

    let currentImageIndex = 0;
    let previousFocusedElement = null;

    // Create the lightbox
    const lightbox = document.createElement("div");

    lightbox.className = "image-lightbox";
    lightbox.id = "image-lightbox";

    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Website image viewer");
    lightbox.setAttribute("aria-hidden", "true");

    lightbox.innerHTML = `
        <div class="image-lightbox-content">

            <button
                type="button"
                class="lightbox-close"
                aria-label="Close image viewer">
                Close
            </button>

            <button
                type="button"
                class="lightbox-prev"
                aria-label="Previous image">
                &#10094;
            </button>

            <img
                class="lightbox-image"
                src=""
                alt="">

            <button
                type="button"
                class="lightbox-next"
                aria-label="Next image">
                &#10095;
            </button>

            <p class="lightbox-caption"></p>

            <p
                class="lightbox-counter"
                aria-live="polite">
            </p>

        </div>
    `;

    document.body.appendChild(lightbox);

    const viewerImage = lightbox.querySelector(".lightbox-image");
    const viewerCaption = lightbox.querySelector(".lightbox-caption");
    const viewerCounter = lightbox.querySelector(".lightbox-counter");

    const closeButton = lightbox.querySelector(".lightbox-close");
    const previousButton = lightbox.querySelector(".lightbox-prev");
    const nextButton = lightbox.querySelector(".lightbox-next");

    // Display the selected image
    function showImage(index) {

        if (!images.length) return;

        currentImageIndex =
            (index + images.length) % images.length;

        const selected = images[currentImageIndex];

        viewerImage.src =
            selected.currentSrc || selected.src;

        viewerImage.alt =
            selected.alt || "EcoFresh Grocers image";

        viewerCaption.textContent =
            selected.dataset.caption ||
            selected.alt ||
            "EcoFresh Grocers";

        viewerCounter.textContent =
            "Image " + (currentImageIndex + 1) +
            " of " + images.length;
    }

    // Open the lightbox
    function openLightbox(index) {

        previousFocusedElement = document.activeElement;

        showImage(index);

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

        viewerImage.removeAttribute("src");

        if (
            previousFocusedElement &&
            typeof previousFocusedElement.focus === "function"
        ) {
            previousFocusedElement.focus();
        }
    }

    // Make images clickable and keyboard accessible
    images.forEach(function (image, index) {

        image.setAttribute("tabindex", "0");

        image.setAttribute("role", "button");

        image.setAttribute(
            "aria-label",
            "Open image: " +
            (image.alt || "EcoFresh Grocers picture")
        );

        image.addEventListener("click", function () {

            if (image.closest("a")) return;

            openLightbox(index);
        });

        image.addEventListener("keydown", function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();

                openLightbox(index);
            }
        });
    });

    // Lightbox buttons
    closeButton.addEventListener("click", closeLightbox);

    previousButton.addEventListener("click", function () {
        showImage(currentImageIndex - 1);
    });

    nextButton.addEventListener("click", function () {
        showImage(currentImageIndex + 1);
    });

    // Close when clicking outside the image
    lightbox.addEventListener("click", function (event) {

        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard controls for the lightbox
    document.addEventListener("keydown", function (event) {

        if (!lightbox.classList.contains("open")) return;

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowRight") {
            showImage(currentImageIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            showImage(currentImageIndex - 1);
        }

        if (event.key === "Tab") {

            const controls = [
                closeButton,
                previousButton,
                nextButton
            ];

            const first = controls[0];
            const last = controls[controls.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            ) {
                event.preventDefault();
                last.focus();

            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    // Enquiry and contact form validation
    document.querySelectorAll("form[data-validate]").forEach(function (form) {

        const fields = Array.from(
            form.querySelectorAll("input, select, textarea")
        );

        fields.forEach(function (field) {

            const error = form.querySelector(
                '[data-error-for="' + field.id + '"]'
            );

            if (error) {

                if (!error.id) {
                    error.id = field.id + "-error";
                }

                field.setAttribute(
                    "aria-describedby",
                    error.id
                );
            }

            field.addEventListener("input", function () {

                if (field.getAttribute("aria-invalid") === "true") {
                    validateField(field, form);
                }
            });

            field.addEventListener("change", function () {

                if (field.getAttribute("aria-invalid") === "true") {
                    validateField(field, form);
                }
            });
        });

        // Validate individual form fields
        function validateField(field, currentForm) {

            const error = currentForm.querySelector(
                '[data-error-for="' + field.id + '"]'
            );

            const value =
                typeof field.value === "string"
                    ? field.value.trim()
                    : "";

            let message = "";

            if (
                field.required &&
                field.type === "checkbox" &&
                !field.checked
            ) {
                message =
                    "Please confirm this checkbox to continue.";

            } else if (field.required && !value) {

                message = "This field is required.";

            } else if (
                field.type === "email" &&
                value &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ) {

                message =
                    "Enter a valid email address, for example name@example.com.";

            } else if (
                field.type === "tel" &&
                value &&
                !/^[+()\d\s-]{7,20}$/.test(value)
            ) {

                message =
                    "Enter a valid phone number, including the country code if applicable.";

            } else if (
                field.minLength > 0 &&
                value &&
                value.length < field.minLength
            ) {

                message =
                    "Please enter at least " +
                    field.minLength +
                    " characters.";
            }

            if (error) {
                error.textContent = message;
            }

            field.setAttribute(
                "aria-invalid",
                String(Boolean(message))
            );

            return !message;
        }

        // Validate the form when submitted
        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const status = form.querySelector("[data-form-status]");

            let valid = true;

            fields.forEach(function (field) {

                if (!validateField(field, form)) {
                    valid = false;
                }
            });

            if (!valid) {

                if (status) {

                    status.className =
                        "form-status notice error";

                    status.textContent =
                        "Please correct the highlighted fields and submit the form again.";
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

                status.className =
                    "form-status notice success";

                status.textContent =
                    "Thank you, " +
                    (data.name || "customer") +
                    ". Your " +
                    (
                        form.dataset.formType === "enquiry"
                            ? "enquiry"
                            : "message"
                    ) +
                    " passed validation. This student project is a front-end demonstration; it does not send or store submissions online.";
            }

            form.reset();

            fields.forEach(function (field) {
                field.removeAttribute("aria-invalid");
            });

            form.querySelectorAll(".field-error").forEach(function (error) {
                error.textContent = "";
            });
        });
    });

    // Back-to-top control
    const topButton = document.querySelector(".back-top");

    if (topButton) {

        function updateTopButton() {

            topButton.classList.toggle(
                "show",
                window.scrollY > 450
            );
        }

        window.addEventListener(
            "scroll",
            updateTopButton,
            { passive: true }
        );

        updateTopButton();

        topButton.addEventListener("click", function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

});


// ============================================
// ECOFRESH DEMONSTRATION SHOPPING CART
// ============================================

const CART_KEY = "ecofresh-demo-cart";

const currency = function (amount) {
    return "R " + Number(amount).toFixed(2);
};

function readCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        // Cart remains usable for the current page session.
    }

    updateCartCount(cart);
}

function updateCartCount(cart) {
    const totalItems = cart.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    document.querySelectorAll(".cart-count").forEach(function (counter) {
        counter.textContent = totalItems;
    });
}

let shoppingCart = readCart();

updateCartCount(shoppingCart);

// ADD PRODUCTS TO CART
document.querySelectorAll(".product-card").forEach(function (card) {

    const addButton = card.querySelector(".add-to-cart");

    if (!addButton) return;

    addButton.addEventListener("click", function () {

        const name = card.querySelector("h3")?.textContent.trim();
        const price = Number(addButton.dataset.price);
        const image = card.querySelector("img")?.getAttribute("src") || "";

        if (!name || !Number.isFinite(price) || price <= 0) return;

        const existing = shoppingCart.find(function (item) {
            return item.name === name;
        });

        if (existing) {
            existing.quantity += 1;
        } else {
            shoppingCart.push({
                name: name,
                price: price,
                quantity: 1,
                image: image
            });
        }

        saveCart(shoppingCart);

        const originalText = addButton.textContent;

        addButton.textContent = "Added to cart";

        window.setTimeout(function () {
            addButton.textContent = originalText;
        }, 1200);
    });
});

// RENDER AND MANAGE THE CHECKOUT CART

const checkoutCart = document.getElementById("checkoutCart");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const deliveryCost = document.getElementById("deliveryCost");

function renderCheckoutCart() {

    if (!checkoutCart) return;

    shoppingCart = readCart();

    updateCartCount(shoppingCart);

    checkoutCart.replaceChildren();

    if (!shoppingCart.length) {

        const emptyMessage = document.createElement("p");

        emptyMessage.innerHTML =
            'Your cart is currently empty. Visit the <a href="products and services.html">products page</a> to add items.';

        checkoutCart.appendChild(emptyMessage);

    } else {

        shoppingCart.forEach(function (item, index) {

            const row = document.createElement("div");
            row.className = "checkout-item";

            const details = document.createElement("div");

            const name = document.createElement("div");
            name.className = "checkout-item-name";
            name.textContent = item.name;

            const controls = document.createElement("div");
            controls.className = "checkout-item-controls";

            const minus = document.createElement("button");
            minus.type = "button";
            minus.textContent = "−";
            minus.setAttribute(
                "aria-label",
                "Decrease " + item.name + " quantity"
            );

            minus.addEventListener("click", function () {
                changeQuantity(index, -1);
            });

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const plus = document.createElement("button");
            plus.type = "button";
            plus.textContent = "+";
            plus.setAttribute(
                "aria-label",
                "Increase " + item.name + " quantity"
            );

            plus.addEventListener("click", function () {
                changeQuantity(index, 1);
            });

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "checkout-remove";
            remove.textContent = "Remove";

            remove.addEventListener("click", function () {
                shoppingCart.splice(index, 1);
                saveCart(shoppingCart);
                renderCheckoutCart();
            });

            controls.append(minus, quantity, plus, remove);

            details.append(name, controls);

            const price = document.createElement("strong");

            price.textContent = currency(
                item.price * item.quantity
            );

            row.append(details, price);

            checkoutCart.appendChild(row);
        });
    }

    const subtotal = shoppingCart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    if (cartSubtotal) {
        cartSubtotal.textContent = currency(subtotal);
    }

    if (deliveryCost) {
        deliveryCost.textContent = currency(0);
    }

    if (cartTotal) {
        cartTotal.textContent = currency(subtotal);
    }
}

// CHANGE PRODUCT QUANTITY

function changeQuantity(index, amount) {

    if (!shoppingCart[index]) return;

    shoppingCart[index].quantity += amount;

    if (shoppingCart[index].quantity <= 0) {
        shoppingCart.splice(index, 1);
    }

    saveCart(shoppingCart);

    renderCheckoutCart();
}

renderCheckoutCart();

// ============================================
// SIMULATED CHECKOUT
// ============================================
// Never request or store banking/card credentials.

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const status = document.getElementById("checkoutStatus");

        const requiredFields = Array.from(
            checkoutForm.querySelectorAll("[required]")
        );

        let valid = true;

        requiredFields.forEach(function (field) {

            let fieldValid =
                field.type === "checkbox"
                    ? field.checked
                    : Boolean(field.value.trim());

            if (
                field.type === "email" &&
                field.value.trim()
            ) {
                fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    field.value.trim()
                );
            }

            field.setAttribute(
                "aria-invalid",
                String(!fieldValid)
            );

            if (!fieldValid) {
                valid = false;
            }
        });

        if (!shoppingCart.length) {

            valid = false;

            if (status) {
                status.className = "form-status notice error";
                status.textContent =
                    "Your cart is empty. Add at least one product before placing an order.";
            }

            return;
        }

        if (!valid) {

            if (status) {
                status.className = "form-status notice error";
                status.textContent =
                    "Please complete all required fields and confirm that you understand this is a demonstration payment.";
            }

            const firstInvalid = checkoutForm.querySelector(
                '[aria-invalid="true"]'
            );

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        const formData = new FormData(checkoutForm);

        const subtotal = shoppingCart.reduce(function (sum, item) {
            return sum + item.price * item.quantity;
        }, 0);

        const orderNumber =
            "EF-DEMO-" + Date.now().toString().slice(-8);

        const confirmation =
            document.getElementById("orderConfirmation");

        const message =
            document.getElementById("confirmationMessage");

        if (message) {

            message.textContent =
                "Thank you, " +
                formData.get("customerName") +
                ". Your demonstration order " +
                orderNumber +
                " has been created with a total of " +
                currency(subtotal) +
                ". Payment method selected: " +
                (
                    formData.get("paymentMethod") === "card-demo"
                        ? "simulated bank card"
                        : "simulated EFT / bank transfer"
                ) +
                ".";
        }

        if (confirmation) {
            confirmation.hidden = false;
        }

        if (status) {
            status.className = "form-status notice success";
            status.textContent =
                "Demonstration checkout completed. No money was taken.";
        }

        shoppingCart = [];

        saveCart(shoppingCart);

        renderCheckoutCart();

        checkoutForm.hidden = true;

        if (confirmation) {
            confirmation.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });
}

// PRINT ORDER SUMMARY

const printOrderButton = document.getElementById("printOrder");

if (printOrderButton) {
    printOrderButton.addEventListener("click", function () {
        window.print();
    });
}
