(function () {
  "use strict";

  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      primaryNav.classList.toggle("open", open);
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    primaryNav.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof HTMLAnchorElement) {
        setOpen(false);
      }
    });

    // Close menu if viewport grows past mobile breakpoint
    const mql = window.matchMedia("(min-width: 900px)");
    const handleViewportChange = (event) => {
      if (event.matches) setOpen(false);
    };
    if (mql.addEventListener) {
      mql.addEventListener("change", handleViewportChange);
    } else if (mql.addListener) {
      mql.addListener(handleViewportChange);
    }

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        navToggle.focus();
      }
    });
  }

  // Copy-link share action card
  const copyTargets = document.querySelectorAll('a[href="#top"].action-card');
  copyTargets.forEach((card) => {
    card.addEventListener("click", async (e) => {
      // Allow modifier-click / middle-click default behavior
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

      try {
        if (navigator.share) {
          e.preventDefault();
          await navigator.share({
            title: document.title,
            text: "Public information about the proposed Gardner data center.",
            url: window.location.href,
          });
          return;
        }
        if (navigator.clipboard && window.isSecureContext) {
          e.preventDefault();
          await navigator.clipboard.writeText(window.location.href);
          flashCopy(card);
        }
      } catch (_err) {
        /* user cancelled or unsupported — let default scroll-to-top happen */
      }
    });
  });

  function flashCopy(card) {
    const link = card.querySelector(".action-link");
    if (!link) return;
    const original = link.textContent;
    link.textContent = "Link copied!";
    setTimeout(() => {
      link.textContent = original;
    }, 1800);
  }

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
