(function () {
  "use strict";

  // =========================================================
  // Site config — single source of truth for shared chrome
  // =========================================================
  const SITE = {
    url: "https://gardnerdatacenter.com",
    name: "Say No to the Gardner Data Center",
  };

  // Key dates / meetings. Ordered by date.
  // Update whenever a meeting is added or moved. Times: America/Chicago (Gardner, KS).
  // Titles & descriptions feed .ics + Google Calendar — keep wording specific to this site.
  const MEETINGS = [
    {
      id: "public-meeting-1",
      title: "Beale public information meeting #1 - Gardner data center proposal",
      start: "2026-05-13T18:00:00-05:00",
      durationMinutes: 90,
      location:
        "Wheatridge Middle School, Gardner, KS",
      description:
        "Hosted by Beale Infrastructure. Information on the proposal with Q&A at the end. In person at Wheatridge Middle School. Calendar entry from Say No to the Gardner Data Center (gardnerdatacenter.com) for neighbor planning only; confirm details with the host.",
    },
    {
      id: "public-meeting-2",
      title: "Beale public information meeting #2 - Gardner data center proposal (virtual)",
      start: "2026-05-15T18:00:00-05:00",
      durationMinutes: 90,
      location: "Virtual (details to be announced)",
      description:
        "Hosted by Beale Infrastructure. Second information session, virtual. Details not yet provided. Q&A at the end. Entry from Say No to the Gardner Data Center; confirm with the host when available.",
    },
    {
      id: "planning-commission",
      title: "Gardner Planning Commission - data center rezoning hearing",
      start: "2026-05-26T19:00:00-05:00",
      durationMinutes: 120,
      location: "Gardner City Hall",
      description:
        "Planning Commission hearing on the rezoning application. Public comment becomes part of the official record. Calendar details from gardnerdatacenter.com (community volunteers). Confirm time and place with the City of Gardner.",
    },
    {
      id: "council-vote",
      title: "Gardner City Council vote - data center rezoning",
      start: "2026-06-15T19:00:00-05:00",
      durationMinutes: 120,
      location: "Gardner City Hall, Gardner, KS 66030",
      description:
        "City Council vote on the rezoning application. Final decision-making meeting. Listing from Say No to the Gardner Data Center for neighbor planning only; the City agenda is the official source.",
    },
  ];

  function syncUrgentBannerOffset() {
    const el = document.getElementById("urgentBanner");
    const h =
      el && el.firstElementChild ? el.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty(
      "--urgent-banner-offset",
      `${Math.round(h)}px`
    );
  }

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
      '<span class="urgent-banner-message">' +
      escapeHtml(dateStr) +
      '</span>' +
      '<span class="urgent-banner-sep" aria-hidden="true">·</span>' +
      '<a href="meetings.html#meetings" class="urgent-banner-link">Learn more</a>' +
      "</span>";
    slot.appendChild(wrap);

    requestAnimationFrame(() => {
      syncUrgentBannerOffset();
    });
    window.addEventListener("resize", syncUrgentBannerOffset, { passive: true });
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
      return new Intl.DateTimeFormat("en-US", opts).format(d);
    } catch (_e) {
      return d.toLocaleString();
    }
  }

  function buildCalendarDescription(meeting) {
    return (
      (meeting.description || "").trim() +
      "\n\n" +
      SITE.name +
      "\n" +
      SITE.url +
      "\nMeetings: " +
      SITE.url +
      "/meetings\nTake action: " +
      SITE.url +
      "/take-action.html"
    );
  }

  // Google Calendar "add event" template (same fields as .ics)
  function googleCalendarUrl(meeting) {
    const start = new Date(meeting.start);
    const end = new Date(
      start.getTime() + (meeting.durationMinutes || 60) * 60 * 1000
    );
    const text = meeting.title + " · " + SITE.name;
    const dates = toIcsDate(start) + "/" + toIcsDate(end);
    const details = buildCalendarDescription(meeting);
    const loc = meeting.location || "";
    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(text) +
      "&dates=" +
      dates +
      "&details=" +
      encodeURIComponent(details) +
      "&location=" +
      encodeURIComponent(loc)
    );
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
      "PRODID:-//gardnerdatacenter.com//Say No Gardner Data Center//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + meeting.id + "@gardnerdatacenter.com",
      "DTSTAMP:" + toIcsDate(new Date()),
      "DTSTART:" + toIcsDate(start),
      "DTEND:" + toIcsDate(end),
      "SUMMARY:" + icsEscape(meeting.title),
      "LOCATION:" + icsEscape(meeting.location || ""),
      "DESCRIPTION:" + icsEscape(buildCalendarDescription(meeting)),
      "URL:" + SITE.url + "/meetings",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gardnerdatacenter-" + meeting.id + ".ics";
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

  function wireIcsAndGcalLinks() {
    const byId = Object.fromEntries(MEETINGS.map((m) => [m.id, m]));
    document.querySelectorAll("[data-gcal]").forEach((el) => {
      const m = byId[el.getAttribute("data-gcal") || ""];
      if (!m) return;
      if (el instanceof HTMLAnchorElement) {
        el.href = googleCalendarUrl(m);
      }
    });
    document.querySelectorAll("[data-ics]").forEach((el) => {
      if (el.dataset.icsWired === "true") return;
      const id = el.getAttribute("data-ics") || "";
      const m = byId[id];
      if (!m) return;
      if (!(el instanceof HTMLElement)) return;
      el.dataset.icsWired = "true";
      el.addEventListener("click", (e) => {
        e.preventDefault();
        downloadIcs(m);
      });
    });
  }

  // Expose meetings + ICS helper for any page that wants to use them
  // (e.g., the meetings page wires per-item calendar links).
  window.__SITE_DATA__ = {
    meetings: MEETINGS,
    site: SITE,
    downloadIcs: downloadIcs,
    googleCalendarUrl: googleCalendarUrl,
    buildCalendarDescription: buildCalendarDescription,
  };

  // Run chrome immediately so it appears as soon as DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      buildBanner();
      wireIcsAndGcalLinks();
    });
  } else {
    buildBanner();
    wireIcsAndGcalLinks();
  }

  // =========================================================
  // Existing nav, share, signup, copy template behavior
  // =========================================================

  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      primaryNav.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
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
