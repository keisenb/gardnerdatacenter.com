(function () {
  "use strict";

  // =========================================================
  // Site config — single source of truth for shared chrome
  // =========================================================
  const SITE = {
    url: "https://www.gardnerdatacenter.com",
    name: "Say No to the Gardner Data Center",
  };

  let metaOutboundClicksWired = false;

  // =========================================================
  // Meta Pixel — standard events (guarded; no PII in params)
  // =========================================================
  function sanitizeMetaParams(params) {
    if (!params || typeof params !== "object") return undefined;
    const out = {};
    for (const [k, v] of Object.entries(params)) {
      if (typeof k !== "string") continue;
      if (!/^[a-z][a-z0-9_]*$/i.test(k)) continue;
      if (typeof v === "string") {
        const t = v.trim().slice(0, 100);
        if (t) out[k] = t;
      } else if (typeof v === "number" && Number.isFinite(v)) {
        out[k] = v;
      }
    }
    return Object.keys(out).length ? out : undefined;
  }

  function trackMeta(eventName, params) {
    if (typeof window.fbq !== "function") return;
    const clean = sanitizeMetaParams(params);
    if (clean) window.fbq("track", eventName, clean);
    else window.fbq("track", eventName);
  }

  function mailtoDomainBucket(href) {
    try {
      const raw = decodeURIComponent(
        href.slice(7).split(/[?&#]/)[0] || ""
      );
      const i = raw.indexOf("@");
      if (i === -1) return "email";
      let domain = raw.slice(i + 1).toLowerCase();
      domain = domain.replace(/[^a-z0-9.-]/g, "");
      return domain || "email";
    } catch (_e) {
      return "email";
    }
  }

  function wireMetaPixelOutboundClicks() {
    if (metaOutboundClicksWired) return;
    metaOutboundClicksWired = true;

    document.addEventListener(
      "click",
      (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        const t = e.target;
        if (!(t instanceof Element)) return;
        const a = t.closest("a[href]");
        if (!(a instanceof HTMLAnchorElement)) return;
        const href = (a.getAttribute("href") || "").trim();
        if (!href || href.startsWith("#")) return;

        const h = href.toLowerCase();

        if (h.includes("paypal.com/ncp/payment")) {
          trackMeta("InitiateCheckout", {
            content_name: "yard_signs",
            currency: "USD",
          });
          return;
        }
        if (h.includes("paypal.com/donate") || /paypal\.com.*hosted_button_id/i.test(href)) {
          trackMeta("Donate", { currency: "USD" });
          return;
        }
        if (h.includes("change.org")) {
          trackMeta("Lead", {
            content_name: "change_org_petition",
            content_category: "advocacy",
          });
          return;
        }
        if (h.includes("highbond.com") && h.includes("requesttospeak")) {
          trackMeta("Lead", {
            content_name: "usd231_request_to_speak",
            content_category: "public_comment",
          });
          return;
        }
        if (h.startsWith("mailto:")) {
          trackMeta("Contact", {
            content_category: "email",
            content_name: mailtoDomainBucket(href),
          });
          return;
        }
        if (h.startsWith("tel:")) {
          trackMeta("Contact", { content_category: "phone" });
        }
      },
      true
    );
  }

  // Key dates / meetings. Ordered by date.
  // Update whenever a meeting is added or moved. Times: America/Chicago (Gardner, KS).
  // Titles & descriptions feed .ics + Google Calendar — keep wording specific to this site.
  const MEETINGS = [
    {
      id: "city-council-may-4",
      title: "Gardner City Council (regular meeting)",
      start: "2026-05-04T19:00:00-05:00",
      durationMinutes: 120,
      location: "Gardner City Hall, Gardner, KS 66030",
      description:
        "Regular City Council meeting. The data center rezoning may or may not be on the agenda; check the official packet before you go. City agendas and minutes: https://www.gardnerkansas.gov/government/city_council/agendas_minutes.php#outer-319",
    },
    {
      id: "usd231-board-may-11",
      title: "USD 231 Board of Education meeting",
      start: "2026-05-11T18:00:00-05:00",
      durationMinutes: 120,
      location: "231 E Madison St, Gardner, KS",
      description:
        "USD 231 Board of Education. Gardner residents may speak at this meeting. Pre-register by 12pm May 11; walk-ins register before 6pm. https://usd231.community.highbond.com/home/public/requesttospeak/0 Confirm with the district.",
    },
    {
      id: "city-council-may-18",
      title: "Gardner City Council (regular meeting)",
      start: "2026-05-18T19:00:00-05:00",
      durationMinutes: 120,
      location: "Gardner City Hall, Gardner, KS 66030",
      description:
        "Regular City Council meeting. The data center rezoning may or may not be on the agenda; check the official packet before you go. City agendas and minutes: https://www.gardnerkansas.gov/government/city_council/agendas_minutes.php",
    },
    {
      id: "planning-commission",
      title: "Gardner Planning Commission - data center rezoning hearing",
      start: "2026-05-26T19:00:00-05:00",
      durationMinutes: 120,
      location: "Gardner City Hall",
      description:
        "Had been listed while the rezoning was active. After Beale Infrastructure withdrew from Gardner (City incentives removed), this item may be dropped — confirm Gardner's Planning Commission agenda. Calendar stub from gardnerdatacenter.com (community archive).",
    },
    {
      id: "council-vote",
      title: "Gardner City Council vote - data center rezoning",
      start: "2026-06-15T19:00:00-05:00",
      durationMinutes: 120,
      location: "Gardner City Hall, Gardner, KS 66030",
      description:
        "Had been listed as a possible Council vote on rezoning. After Beale withdrew, confirm whether this item remains on the agenda. City agenda is the official source. Listing from gardnerdatacenter.com (community archive).",
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

    const wrap = document.createElement("div");
    wrap.className = "urgent-banner-inner";
    wrap.innerHTML =
      '<span class="urgent-banner-text">' +
      '<span class="urgent-banner-label">Project update</span>' +
      '<span class="urgent-banner-message">' +
      "Beale Infrastructure withdrew from Gardner after the City removed project incentives. " +
      "This site stays up as a public reference." +
      "</span>" +
      '<span class="urgent-banner-sep" aria-hidden="true">·</span>' +
      '<a href="the-proposal.html" class="urgent-banner-link">What was proposed</a>' +
      "</span>";
    slot.appendChild(wrap);

    requestAnimationFrame(() => {
      syncUrgentBannerOffset();
    });
    window.addEventListener("resize", syncUrgentBannerOffset, { passive: true });
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
      "/meetings\nResources: " +
      SITE.url +
      "/resources"
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
  function hydrateTakeActionMeetingCallout() {
    const root = document.getElementById("nextMeetingCallout");
    if (!root) return;
    root.innerHTML =
      '<div class="meeting-callout-body meeting-callout-body--archive">' +
      '<span class="meeting-callout-label">City meetings</span>' +
      "<h3>Gardner may still hold meetings on other topics</h3>" +
      '<p class="meeting-callout-where">The developer-led outreach for this rezoning ended when Beale withdrew. ' +
      "Check the City's published agendas if you follow local meetings for other matters. " +
      '<a href="meetings.html#meetings">Meeting schedule page</a> lists dates that had been circulated during the debate.</p>' +
      "</div>";
  }

  function hydrateMeetingsTimelinePastState() {
    const items = document.querySelectorAll(
      ".meetings-schedule .timeline .timeline-item"
    );
    if (!items.length) return;
    const byId = Object.fromEntries(MEETINGS.map((m) => [m.id, m]));
    const now = Date.now();
    items.forEach((li) => {
      const calEl = li.querySelector("[data-ics]");
      if (!calEl) return;
      const id = calEl.getAttribute("data-ics") || "";
      const m = byId[id];
      if (!m) return;
      const endMs =
        new Date(m.start).getTime() +
        (m.durationMinutes || 60) * 60 * 1000;
      const past = now > endMs;
      li.classList.remove("is-past", "is-upcoming");
      li.classList.add(past ? "is-past" : "is-upcoming");
    });
  }

  function wireIcsAndGcalLinks() {
    const byId = Object.fromEntries(MEETINGS.map((m) => [m.id, m]));
    document.querySelectorAll("[data-gcal]").forEach((el) => {
      const id = el.getAttribute("data-gcal") || "";
      const m = byId[id];
      if (!m) return;
      if (el instanceof HTMLAnchorElement) {
        el.href = googleCalendarUrl(m);
      }
      if (el instanceof HTMLElement && el.dataset.gcalTracked !== "true") {
        el.dataset.gcalTracked = "true";
        el.addEventListener("click", () => {
          trackMeta("Schedule", {
            content_name: id,
            content_category: "meeting_calendar",
          });
        });
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
        trackMeta("Schedule", {
          content_name: id,
          content_category: "meeting_calendar",
        });
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
      hydrateTakeActionMeetingCallout();
      hydrateMeetingsTimelinePastState();
      buildBanner();
      wireIcsAndGcalLinks();
      wireMetaPixelOutboundClicks();
    });
  } else {
    hydrateTakeActionMeetingCallout();
    hydrateMeetingsTimelinePastState();
    buildBanner();
    wireIcsAndGcalLinks();
    wireMetaPixelOutboundClicks();
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
            text: "Archived public information about the Gardner data center debate.",
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

  function buildRepMailtoBody(addressee) {
    const salutation =
      addressee && addressee.trim()
        ? "Dear " + addressee.trim() + ",\n\n"
        : "Dear Mayor / Council Member / Commissioner,\n\n";
    return (
      salutation +
      "My name is [Your Name] and I live at [Your Address]. I'm writing regarding the Gardner data center proposal that had been marketed for land southeast of town.\n\n" +
      "[Add your question or comment here — for example, how the City will approach incentives or compatible land use if another developer appears.]\n\n" +
      "Thank you for your time and service.\n\n" +
      "Respectfully,\n" +
      "[Your Name]"
    );
  }

  // Each <a class="rep-mailto"> starts with a plain mailto:email href
  // (so right-click → copy email, and JS-disabled users still get a
  // working email link). On load, JS rewrites the href to add subject and body.
  document.querySelectorAll(".rep-mailto").forEach((a) => {
    const original = a.getAttribute("href") || "";
    if (!original.startsWith("mailto:")) return;
    const email = original.slice("mailto:".length).split("?")[0];
    const greeting = a.dataset.greeting || "";
    const subject = "Gardner data center proposal — question for elected officials";
    const body = buildRepMailtoBody(greeting);
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
        copyBtn.textContent = "Couldn't copy, select manually";
      }
    });
  }
})();
