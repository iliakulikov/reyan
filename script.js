document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll('a[href^="#"]:not(.service-link)');
  const contactDialog = document.querySelector("#contact-dialog");
  const successDialog = document.querySelector("#success-dialog");
  const contactForm = document.querySelector("#contact-form");
  const openContactButton = document.querySelector("[data-open-contact]");
  const heroNav = document.querySelector(".hero-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const site = document.querySelector(".site");
  const serviceSelect = contactForm?.querySelector('select[name="service"]');
  const trackingInput = contactForm?.querySelector('#form-tracking');

  const updateTracking = () => {
    if (!trackingInput) {
      return;
    }

    const url = new URL(window.location.href);
    const parameters = Array.from(url.searchParams.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    trackingInput.value = [
      `Landing URL: ${url.href}`,
      `Query string: ${url.search || "(none)"}`,
      `URL parameters:\n${parameters || "(none)"}`,
      `Referrer: ${document.referrer || "(direct)"}`
    ].join("\n\n");
  };

  updateTracking();

  const syncScaledDesktopLayout = () => {
    if (!site) {
      return;
    }

    if (window.innerWidth >= 768 && window.innerWidth < 1400) {
      site.style.zoom = String(window.innerWidth / 1400);
      return;
    }

    site.style.removeProperty("zoom");
  };

  syncScaledDesktopLayout();
  window.addEventListener("resize", syncScaledDesktopLayout, { passive: true });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      heroNav?.classList.remove("menu-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = heroNav?.classList.toggle("menu-open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && heroNav?.classList.contains("menu-open")) {
      heroNav.classList.remove("menu-open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.focus();
    }
  });

  const closeDialog = (dialog) => {
    if (dialog?.open) {
      dialog.close();
    }
  };

  openContactButton?.addEventListener("click", () => {
    if (serviceSelect) {
      serviceSelect.value = "";
    }

    contactDialog?.showModal();
  });

  document.querySelectorAll(".service-link[data-service]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      if (serviceSelect) {
        serviceSelect.value = link.dataset.service ?? "";
      }

      contactDialog?.showModal();
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  [contactDialog, successDialog].forEach((dialog) => {
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeDialog(dialog);
      }
    });
  });

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('[type="submit"]');
    const originalLabel = submitButton?.textContent ?? "Submit";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch("https://formsubmit.co/ajax/agencybyreyan@gmail.com", {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: formData
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      closeDialog(contactDialog);
      contactForm.reset();
      updateTracking();
      successDialog?.showModal();
    } catch (error) {
      console.error(error);
      window.alert("We couldn't send your message. Please check your connection and try again.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
});
