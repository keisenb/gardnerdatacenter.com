(function () {
  "use strict";

  // =========================================================
  // Site config — single source of truth for shared chrome
  // =========================================================
  const SITE = {
    url: "https://saynodatacentergardnerks.com",
    name: "Say No to the Gardner Data Center",
  };

  // Key dates / meetings. Ordered by date.
  // Update this array whenever a meeting is added or moved.
  // Times are local to America/Chicago (Gardner, KS).
  const MEETINGS = [
    {
      id: "public-meeting-1",
      title: "Public Meeting #1 (Gardner)",
      shortTitle: "Public Meeting",
      // ISO datetime with -05:00 (CDT in May 2026)
      start: "2026-05-13T18:00:00-05:00",
      durationMinutes: 90,
      location: "City Hall, 120 E. Main St., Gardner, KS",
      description:
        "Public meeting on the proposed Beale Infrastructure data center at 191st & S. Clare Rd. Bring questions and comments.",
    },
    {
      id: "public-meeting-2",
      title: "Public Meeting #2 (Gardner)",
      shortTitle: "Public Meeting",
      start: "2026-05-15T18:00:00-05:00",
      durationMinutes: 90,
      location: "City Hall, 120 E. Main St., Gardner, KS",
      description:
        "Second public meeting on the proposed Beale Infrastructure data center at 191st & S. Clare Rd.",
    },
    {
      id: "planning-commission",
      title: "Gardner Planning Commission Hearing",
      shortTitle: "Planning Commission",
      start: "2026-05-26T19:00:00-05:00",
      durationMinutes: 120,
      location: "City Hall, Council Chambers, 120 E. Main St., Gardner, KS",
      description:
        "Planning Commission hearing on the rezoning application. Public comment is taken at this meeting and becomes part of the official record.",
    },
    {
      id: "protest-petition-deadline",
      title: "Protest Petition Deadline (approx.)",
      shortTitle: "Protest Petition Deadline",
      start: "2026-06-09T17:00:00-05:00",
      durationMinutes: 60,
      location: "Gardner City Clerk, 120 E. Main St., Gardner, KS",
      description:
        "Approximate deadline to file a valid protest petition under K.S.A. 12-757 — 14 days after the Planning Commission hearing concludes. Verify exact deadline with the City Clerk.",
    },
    {
      id: "council-vote",
      title: "Gardner City Council Vote",
      shortTitle: "City Council Vote",
      start: "2026-06-15T19:00:00-05:00",
      durationMinutes: 120,
      location: "City Hall, Council Chambers, 120 E. Main St., Gardner, KS",
      description:
        "City Council vote on the rezoning application. Final decision-making meeting.",
    },
  ];

  // =========================================================
  // Build the urgent top banner
  // =========================================================
  function buildBanner() {
    const slot = document.getElementById("urgentBanner");
    if (!slot) return;

    const next = nextMeeting();
    if (!next) return;

    const dateStr = formatDateShort(next.start);
    const wrap = document.createElement("div");
    wrap.className = "urgent-banner-inner";
    wrap.innerHTML =
      '<span class="urgent-banner-text">' +
      '<span class="urgent-banner-label">Next meeting</span>' +
      '<span class="urgent-banner-message"><strong>' +
      escapeHtml(next.shortTitle) +
      "</strong> — " +
      escapeHtml(dateStr) +
      "</span>" +
      "</span>" +
      '<span class="urgent-banner-actions">' +
      '<button type="button" class="urgent-banner-cta" data-ics="' +
      next.id +
      '">Add to calendar</button>' +
      "</span>";
    slot.appendChild(wrap);

    // Wire .ics download
    const icsBtn = wrap.querySelector("[data-ics]");
    if (icsBtn) {
      icsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        downloadIcs(next);
      });
    }
  }

  function nextMeeting() {
    const now = Date.now();
    return (
      MEETINGS.find((m) => new Date(m.start).getTime() > now) ||
      MEETINGS[MEETINGS.length - 1]
    );
  }

  function formatDateShort(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const opts = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
    };
    try {
      return new Intl.DateTimeFormat("en-US", opts).format(d) + " CT";
    } catch (_e) {
      return d.toLocaleString();
    }
  }

  // .ics generator (per VCALENDAR / RFC 5545)
  function downloadIcs(meeting) {
    const start = new Date(meeting.start);
    const end = new Date(
      start.getTime() + (meeting.durationMinutes || 60) * 60 * 1000
    );
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Say No Gardner Data Center//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + meeting.id + "@saynodatacentergardnerks.com",
      "DTSTAMP:" + toIcsDate(new Date()),
      "DTSTART:" + toIcsDate(start),
      "DTEND:" + toIcsDate(end),
      "SUMMARY:" + icsEscape(meeting.title),
      "LOCATION:" + icsEscape(meeting.location || ""),
      "DESCRIPTION:" + icsEscape(meeting.description || ""),
      "URL:" + SITE.url + "/timeline.html",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = meeting.id + ".ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 250);
  }
  function toIcsDate(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  }
  function icsEscape(s) {
    return String(s)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Expose meetings + ICS helper for any page that wants to use them
  // (e.g., the timeline page wires per-item "Add to calendar" links).
  window.__SITE_DATA__ = {
    meetings: MEETINGS,
    site: SITE,
    downloadIcs: downloadIcs,
  };

  // =========================================================
  // Sticky "Take Action" CTA
  // =========================================================
  function buildStickyCta() {
    if (document.body.classList.contains("is-take-action")) return;
    if (document.querySelector(".sticky-cta")) return;
    const a = document.createElement("a");
    a.href = "take-action.html";
    a.className = "sticky-cta";
    a.setAttribute("aria-label", "Take action on the Gardner data center");
    a.textContent = "Take Action";
    document.body.appendChild(a);
  }

  // Run chrome immediately so it appears as soon as DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      buildBanner();
      buildStickyCta();
    });
  } else {
    buildBanner();
    buildStickyCta();
  }

  // =========================================================
  // Existing nav, share, year, signup, copy template behavior
  // =========================================================

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

  // Per-representative mailto enhancement -------------------
  // Each <a class="rep-mailto"> starts with a plain mailto:email href
  // (so right-click → copy email, and JS-disabled users still get a
  // working email link). On load, JS rewrites the href to add a
  // role-appropriate subject and body, properly URL-encoded.
  document.querySelectorAll(".rep-mailto").forEach((a) => {
    const original = a.getAttribute("href") || "";
    if (!original.startsWith("mailto:")) return;
    const email = original.slice("mailto:".length).split("?")[0];
    const greeting = a.dataset.greeting || "";
    const ask = a.dataset.ask || "share my concerns";
    const subject = "Concerned about the proposed data center in Gardner";
    const body =
      "Dear " + greeting + ",\n\n" +
      "I'm a resident writing to share my concerns about the proposed data center in Gardner. I'm asking you to " + ask + ".\n\n" +
      "Thank you for your time.\n\n" +
      "[Your name]\n" +
      "[Your address]";
    const url =
      "mailto:" + encodeURIComponent(email).replace(/%40/g, "@") +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    a.setAttribute("href", url);
  });

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
