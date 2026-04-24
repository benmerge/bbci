const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const revealItems = [...document.querySelectorAll(".reveal")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealItems.forEach((item) => {
        if (item === entry.target) {
          item.classList.add("is-visible");
        }
      });
    });
  },
  {
    threshold: 0.18,
  },
);

revealItems.forEach((item) => sectionObserver.observe(item));

const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      const targetId = link.getAttribute("href");
      link.classList.toggle("is-active", targetId === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.2, 0.5, 0.8],
  },
);

sections.forEach((section) => navObserver.observe(section));

const contactForms = [...document.querySelectorAll("form[data-contact-form]")];

contactForms.forEach((form) => {
  const statusEl = document.createElement("p");
  statusEl.className = "form-status";
  statusEl.setAttribute("role", "status");
  statusEl.setAttribute("aria-live", "polite");
  form.appendChild(statusEl);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const originalLabel = submitButton ? submitButton.textContent : "";
    const formName = form.dataset.contactForm;

    const data = new FormData(form);
    const fields = {};
    let botField = "";
    for (const [key, value] of data.entries()) {
      if (key === "form-name") continue;
      if (key === "bot-field") {
        botField = String(value ?? "");
        continue;
      }
      fields[key] = typeof value === "string" ? value : "";
    }

    statusEl.textContent = "Sending...";
    statusEl.dataset.state = "pending";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formName, fields, botField }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${response.status})`);
      }

      statusEl.textContent = "Thanks — your message was sent. BBCI will follow up shortly.";
      statusEl.dataset.state = "success";
      form.reset();
    } catch (err) {
      statusEl.textContent = `Sorry, we couldn't send that. ${err.message}. You can also email info@badgerland-BBCI.org.`;
      statusEl.dataset.state = "error";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });
});
