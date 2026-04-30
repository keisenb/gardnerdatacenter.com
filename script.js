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
  const yearEls = document.querySelectorAll("#year");
  yearEls.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Email signup form (Formspree-compatible) ----------------
  const signupForm = document.getElementById("signupForm");
  const signupStatus = document.getElementById("signupStatus");

  if (signupForm && signupStatus) {
    signupForm.addEventListener("submit", async (e) => {
      const action = signupForm.getAttribute("action") || "";

      // If the form action hasn't been configured yet, don't submit a broken request.
      if (!action || action.includes("REPLACE_WITH_FORM_ID")) {
        e.preventDefault();
        signupStatus.textContent =
          "Thanks! The signup form isn't connected yet — please check back soon.";
        signupStatus.className = "form-status";
        return;
      }

      e.preventDefault();
      const formData = new FormData(signupForm);
      const submitBtn = signupForm.querySelector(".form-submit");
      const originalLabel = submitBtn ? submitBtn.textContent : "";

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending...";
        }
        signupStatus.textContent = "";
        signupStatus.className = "form-status";

        const response = await fetch(action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          signupStatus.textContent =
            "You're on the list. Watch your inbox for updates.";
          signupStatus.className = "form-status is-success";
          signupForm.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          const msg =
            (data && data.errors && data.errors[0] && data.errors[0].message) ||
            "Something went wrong. Please try again.";
          signupStatus.textContent = msg;
          signupStatus.className = "form-status is-error";
        }
      } catch (_err) {
        signupStatus.textContent =
          "Couldn't reach the signup service. Please try again later.";
        signupStatus.className = "form-status is-error";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Sign me up";
        }
      }
    });
  }

  // Email template "Copy" button ----------------------------
  const copyBtn = document.getElementById("copyTemplateBtn");
  const templateBody = document.getElementById("templateBody");
  if (copyBtn && templateBody) {
    copyBtn.addEventListener("click", async () => {
      const text = templateBody.textContent || "";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const range = document.createRange();
          range.selectNodeContents(templateBody);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand("copy");
          sel.removeAllRanges();
        }
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 1800);
      } catch (_err) {
        copyBtn.textContent = "Couldn't copy — select manually";
      }
    });
  }
})();
