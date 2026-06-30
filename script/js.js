document.addEventListener("DOMContentLoaded", () => {

    /*=====================================
        Navbar Scroll
    =====================================*/
    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 30);
    });

    /*=====================================
        Smooth Scroll
    =====================================*/
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));
            if (!target) return;
            e.preventDefault();
            // Close mobile menu if open
            navLinks.classList.remove("show");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.classList.remove("active");
            window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        });
    });

    /*=====================================
        Before / After Slider
    =====================================*/
    const sliderInput = document.getElementById("compare-slider");
    const sliderContainer = document.getElementById("slider");

    if (sliderInput && sliderContainer) {
        const foreground = sliderContainer.querySelector(".foreground-img");
        const button = sliderContainer.querySelector(".slider-button");
        sliderInput.addEventListener("input", function () {
            foreground.style.width = this.value + "%";
            button.style.left = this.value + "%";
        });
    }

    /*=====================================
        Mobile Menu
    =====================================*/
    const menuBtn = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            const expanded = menuBtn.getAttribute("aria-expanded") === "true";
            menuBtn.setAttribute("aria-expanded", String(!expanded));
            navLinks.classList.toggle("show");
            menuBtn.classList.toggle("active");
        });
    }

    /*=====================================
        FAQ Accordion
    =====================================*/
    document.querySelectorAll(".accordion-header").forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".accordion-item");
            const isActive = item.classList.contains("active");

            // Close all
            document.querySelectorAll(".accordion-item").forEach(i => {
                i.classList.remove("active");
                i.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
            });

            // Open clicked if it was closed
            if (!isActive) {
                item.classList.add("active");
                header.setAttribute("aria-expanded", "true");
            }
        });
    });

    /*=====================================
        Scroll Reveal
    =====================================*/
    const reveals = document.querySelectorAll(".feature-card, .step-card, .trust ul li, .accordion-item");
    reveals.forEach(el => el.classList.add("reveal"));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => revealObserver.observe(el));

    /*=====================================
        Toast Notifications
    =====================================*/
    const toastContainer = document.getElementById("toast-container");

    function showToast(message, type = "info", duration = 3500) {
        const icons = { success: "✅", error: "❌", info: "ℹ️" };
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-out");
            toast.addEventListener("animationend", () => toast.remove());
        }, duration);
    }

    /*=====================================
        Contact Form
    =====================================*/
    const contactSubmit = document.getElementById("contact-submit");
    if (contactSubmit) {
        contactSubmit.addEventListener("click", () => {
            const name  = document.getElementById("contact-name");
            const email = document.getElementById("contact-email");
            const msg   = document.getElementById("contact-message");
            let valid = true;

            [name, email, msg].forEach(f => f.classList.remove("input-error"));

            if (!name.value.trim())  { name.classList.add("input-error");  valid = false; }
            if (!email.value.trim() || !email.value.includes("@")) { email.classList.add("input-error"); valid = false; }
            if (!msg.value.trim())   { msg.classList.add("input-error");   valid = false; }

            if (!valid) {
                showToast("Please fill in all fields correctly.", "error");
                return;
            }
            showToast("Message sent! We'll get back to you within 24 hours.", "success");
            name.value = "";
            email.value = "";
            msg.value = "";
        });
    }

    /*=====================================
        Upload Elements
    =====================================*/
    const dropZone       = document.getElementById("drop-zone");
    const fileInput      = document.getElementById("file-input");
    const selectBtn      = document.getElementById("select-btn");
    const removeBtn      = document.getElementById("remove-img");
    const errorBox       = document.getElementById("error-msg");
    const defaultContent = document.getElementById("upload-content-default");
    const preview        = document.getElementById("upload-preview");
    const previewImg     = document.getElementById("image-display");
    const fileNameEl     = document.getElementById("file-name");
    const fileSizeEl     = document.getElementById("file-size");
    const loadingEl      = document.getElementById("upload-loading");
    const loaderStatus   = document.getElementById("loader-status");
    const progressBar    = document.getElementById("progress-bar");
    const resultContainer = document.getElementById("result-container");
    const resultImage    = document.getElementById("result-image");
    const downloadBtn    = document.getElementById("download-btn");
    const createAnotherBtn = document.getElementById("create-another-btn");

    /*=====================================
        Constants & State
    =====================================*/
    const MAX_SIZE     = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
    let selectedFile   = null;
    let isProcessing   = false;

    const LOADER_STEPS = [
        { text: "Uploading Image...",        progress: 20  },
        { text: "Detecting Face...",         progress: 40  },
        { text: "Removing Background...",    progress: 65  },
        { text: "Optimizing Image...",       progress: 85  },
        { text: "Preparing Passport Photo...", progress: 95 }
    ];

    /*=====================================
        Helper Functions
    =====================================*/
    function formatSize(bytes) {
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove("hidden");
        showToast(message, "error");
    }

    function hideError() {
        errorBox.classList.add("hidden");
    }

    function showDefaultState() {
        defaultContent.classList.remove("hidden");
        preview.classList.add("hidden");
        loadingEl.classList.add("hidden");
        resultContainer.classList.add("hidden");
        selectBtn.classList.remove("hidden");
        selectBtn.innerHTML = "Select Image";
        selectBtn.disabled = false;
    }

    function showPreviewState() {
        defaultContent.classList.add("hidden");
        preview.classList.remove("hidden");
        loadingEl.classList.add("hidden");
        resultContainer.classList.add("hidden");
        selectBtn.classList.remove("hidden");
        selectBtn.innerHTML = "Create Passport Photo";
        selectBtn.disabled = false;
    }

    function showLoadingState() {
        defaultContent.classList.add("hidden");
        preview.classList.add("hidden");
        loadingEl.classList.remove("hidden");
        resultContainer.classList.add("hidden");
        selectBtn.classList.add("hidden");
        progressBar.style.width = "0%";
        loaderStatus.textContent = LOADER_STEPS[0].text;
    }

    function showResultState() {
        defaultContent.classList.add("hidden");
        preview.classList.add("hidden");
        loadingEl.classList.add("hidden");
        resultContainer.classList.remove("hidden");
        selectBtn.classList.add("hidden");
    }

    function resetUploader() {
        selectedFile = null;
        isProcessing = false;
        fileInput.value = "";
        previewImg.src = "";
        resultImage.src = "";
        downloadBtn.href = "";
        fileNameEl.textContent = "";
        fileSizeEl.textContent = "";
        hideError();
        showDefaultState();
    }

    function validateFile(file) {
        if (!ALLOWED_TYPES.includes(file.type)) {
            showError("Only JPG and PNG images are allowed.");
            return false;
        }
        if (file.size > MAX_SIZE) {
            showError("File too large. Maximum size is 10MB.");
            return false;
        }
        return true;
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => { previewImg.src = e.target.result; };
        reader.readAsDataURL(file);
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatSize(file.size);
        hideError();
        showPreviewState();
        showToast("Image selected. Click 'Create Passport Photo'.", "info");
    }

    function processFile(file) {
        if (!file || !validateFile(file)) return;
        selectedFile = file;
        showPreview(file);
    }

    /*=====================================
        Animated Loader
    =====================================*/
    function runLoaderAnimation() {
        return new Promise((resolve) => {
            let stepIndex = 0;

            function nextStep() {
                if (stepIndex >= LOADER_STEPS.length) {
                    resolve();
                    return;
                }
                const step = LOADER_STEPS[stepIndex];
                loaderStatus.textContent = step.text;
                progressBar.style.width = step.progress + "%";
                stepIndex++;
                setTimeout(nextStep, 900);
            }

            nextStep();
        });
    }

    /*=====================================
        Primary Action Button
    =====================================*/
    selectBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // If no file selected, open file picker
        if (!selectedFile) {
            fileInput.click();
            return;
        }

        // Prevent double submission
        if (isProcessing) return;
        isProcessing = true;

        hideError();
        showLoadingState();

        const formData = new FormData();
        formData.append("image", selectedFile);

        // Start the visual loader animation in parallel
        const loaderPromise = runLoaderAnimation();

        try {
            const controller = new AbortController();
            // 60s timeout — rembg can take time on first run
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Processing failed.");
            }

            // Wait for loader animation to finish before showing result
            await loaderPromise;

            // Final progress bar
            progressBar.style.width = "100%";
            loaderStatus.textContent = "Done ✅";

            await new Promise(r => setTimeout(r, 500));

            const imageURL = "/uploads/" + data.image;
            resultImage.src = imageURL;
            downloadBtn.href = imageURL;
            downloadBtn.setAttribute("download", "passport-photo.png");

            showResultState();
            showToast("Passport photo ready!", "success");

            resultContainer.scrollIntoView({ behavior: "smooth", block: "center" });

        } catch (err) {
            const msg = err.name === "AbortError"
                ? "Request timed out. Please try again."
                : (err.message || "Something went wrong.");

            showError(msg);
            showPreviewState();
        } finally {
            isProcessing = false;
        }
    });

    /*=====================================
        File Input Change
    =====================================*/
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    /*=====================================
        Remove Image
    =====================================*/
    removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetUploader();
    });

    /*=====================================
        Create Another Photo
    =====================================*/
    createAnotherBtn.addEventListener("click", () => {
        resetUploader();
        document.getElementById("upload-section").scrollIntoView({ behavior: "smooth", block: "center" });
    });

    /*=====================================
        Download Button — feedback + auto reset
    =====================================*/
    downloadBtn.addEventListener("click", () => {
        showToast("Download started!", "success");
        // Auto-reset after 3 seconds
        setTimeout(() => {
            resetUploader();
        }, 3000);
    });

    /*=====================================
        Drag & Drop
    =====================================*/
    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isProcessing) dropZone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        if (isProcessing) return;
        const files = e.dataTransfer.files;
        if (files.length > 0) processFile(files[0]);
    });

}); // End DOMContentLoaded
