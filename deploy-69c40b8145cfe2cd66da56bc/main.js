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
