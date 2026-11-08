(function () {
  "use strict";

  var PHONE = "96171752289";

  /* ==========================================================
     CALENDLY: paste Omar's booking link between the quotes,
     e.g. "https://calendly.com/omarsoussi/private-lesson"
     Leave it empty to show the "coming soon" message instead.
     ========================================================== */
  var CALENDLY_URL = "";

  /* ==========================================================
     SOCIAL LINKS: paste full profile links; leave "" to hide.
     WhatsApp is always shown.
     ========================================================== */
  // PLACEHOLDERS: these point to the platforms' home pages for now.
  // Replace each with Omar's real profile link, e.g. "https://instagram.com/omar.soussi"
  var SOCIAL = {
    instagram: "https://www.instagram.com/",
    facebook:  "https://www.facebook.com/",
    linkedin:  "https://www.linkedin.com/",
    youtube:   "https://www.youtube.com/",
    tiktok:    "https://www.tiktok.com/"
  };
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Language ---------- */
  var META = {
    ar: { title: "عمر ربيع السوسي | مدرّس لغة عربية", dir: "rtl" },
    en: { title: "Omar Rabih Soussi | Arabic Language Teacher", dir: "ltr" }
  };

  function storedLang() {
    try { return localStorage.getItem("lang"); } catch (e) { return null; }
  }

  function setLang(lang, save) {
    if (!META[lang]) lang = "ar";
    root.setAttribute("lang", lang);
    root.setAttribute("dir", META[lang].dir);
    root.setAttribute("data-lang", lang);
    document.title = META[lang].title;

    // placeholders
    document.querySelectorAll("[data-ph-" + lang + "]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-ph-" + lang);
    });
    // <option> labels
    document.querySelectorAll("option[data-" + lang + "]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });

    if (save) { try { localStorage.setItem("lang", lang); } catch (e) {} }
  }

  var urlLang = new URLSearchParams(location.search).get("lang");
  setLang(urlLang || storedLang() || "ar", !!urlLang);

  document.getElementById("langToggle").addEventListener("click", function () {
    setLang(root.dataset.lang === "ar" ? "en" : "ar", true);
  });

  function current() { return root.dataset.lang; }

  /* ---------- Mobile menu ---------- */
  var nav = document.getElementById("mainNav");
  var menuBtn = document.getElementById("menuToggle");
  function closeMenu() { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Count-up stats ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counters = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = +el.dataset.count, start = null;
        co.unobserve(el);
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1200, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + "+";
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Custom select (bottom sheet on phones, dropdown elsewhere) ---------- */
  var backdrop = document.createElement("div");
  backdrop.className = "cselect-backdrop";
  document.body.appendChild(backdrop);
  var openSelect = null;
  var refreshers = [];
  var chevron = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>';
  var check = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5 10 17l9-10"/></svg>';
  function isPhone() { return window.matchMedia("(max-width: 600px)").matches; }

  function enhanceSelect(select, idx) {
    var label = document.querySelector('label[for="' + select.id + '"]');
    var wrap = document.createElement("div");
    wrap.className = "cselect";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add("cselect-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cselect-trigger";
    trigger.id = (select.id || "cs" + idx) + "-btn";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = '<span class="cselect-value"></span><span class="cselect-chev">' + chevron + "</span>";
    wrap.appendChild(trigger);
    if (label) {
      label.setAttribute("for", trigger.id);
      trigger.setAttribute("aria-labelledby", label.id || (label.id = trigger.id + "-lbl"));
    }

    var panel = document.createElement("div");
    panel.className = "cselect-panel";
    panel.innerHTML =
      '<div class="cselect-head"><span class="cselect-grab"></span>' +
      '<span class="cselect-title">' + (label ? label.innerHTML.replace("*", "") : "") + "</span>" +
      '<button type="button" class="cselect-close" aria-label="Close">✕</button></div>' +
      '<ul class="cselect-list" role="listbox"></ul>';
    wrap.appendChild(panel);
    var list = panel.querySelector(".cselect-list");

    function render() {
      trigger.querySelector(".cselect-value").textContent = select.options[select.selectedIndex].textContent;
      list.innerHTML = "";
      Array.prototype.forEach.call(select.options, function (opt, i) {
        var li = document.createElement("li");
        li.setAttribute("role", "option");
        li.tabIndex = -1;
        li.dataset.index = i;
        li.setAttribute("aria-selected", String(i === select.selectedIndex));
        li.innerHTML = "<span>" + opt.textContent + '</span><span class="cselect-check">' + check + "</span>";
        list.appendChild(li);
      });
    }

    function open() {
      if (openSelect) openSelect.close();
      render();
      wrap.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      backdrop.classList.add("show");
      if (isPhone()) document.body.classList.add("no-scroll");
      openSelect = api;
      var sel = list.querySelector('[aria-selected="true"]') || list.firstChild;
      setTimeout(function () { sel.focus({ preventScroll: true }); sel.scrollIntoView({ block: "nearest" }); }, 30);
    }
    function close(refocus) {
      wrap.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      backdrop.classList.remove("show");
      document.body.classList.remove("no-scroll");
      openSelect = null;
      if (refocus) trigger.focus({ preventScroll: true });
    }
    function choose(i) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close(true);
    }

    trigger.addEventListener("click", function () { wrap.classList.contains("open") ? close(true) : open(); });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(); }
    });
    panel.querySelector(".cselect-close").addEventListener("click", function () { close(true); });
    list.addEventListener("click", function (e) {
      var li = e.target.closest("li");
      if (li) choose(+li.dataset.index);
    });
    list.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(list.children);
      var i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(i - 1, 0)].focus(); }
      else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i > -1) choose(i); }
      else if (e.key === "Tab") { close(false); }
    });
    select.addEventListener("change", render);

    var api = { close: close, wrap: wrap };
    refreshers.push(function () {
      render();
      if (label) panel.querySelector(".cselect-title").innerHTML = label.innerHTML.replace("*", "");
    });
    render();
  }

  document.querySelectorAll("select").forEach(enhanceSelect);

  backdrop.addEventListener("click", function () { if (openSelect) openSelect.close(false); });
  document.addEventListener("click", function (e) {
    if (openSelect && !openSelect.wrap.contains(e.target)) openSelect.close(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openSelect) openSelect.close(true);
  });
  document.getElementById("langToggle").addEventListener("click", function () {
    refreshers.forEach(function (fn) { fn(); });
  });

  /* ---------- Booking tabs: calendar / message ---------- */
  var form = document.getElementById("bookForm");
  var tabCal = document.getElementById("tab-cal");
  var tabMsg = document.getElementById("tab-msg");
  var panelCal = document.getElementById("panel-cal");
  var calEmbed = document.getElementById("calEmbed");
  var calLoaded = false;

  function showTab(which) {
    var cal = which === "cal";
    tabCal.setAttribute("aria-selected", String(cal));
    tabMsg.setAttribute("aria-selected", String(!cal));
    panelCal.hidden = !cal;
    form.hidden = cal;
    if (cal) loadCalendly();
  }
  tabCal.addEventListener("click", function () { showTab("cal"); });
  tabMsg.addEventListener("click", function () { showTab("msg"); });
  document.getElementById("calToMsg").addEventListener("click", function () {
    showTab("msg");
    document.getElementById("f-name").focus();
  });
  [tabCal, tabMsg].forEach(function (t) {
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        var other = t === tabCal ? tabMsg : tabCal;
        other.focus(); other.click();
      }
    });
  });

  function loadCalendly() {
    if (calLoaded) return;
    calLoaded = true;
    if (!CALENDLY_URL) { document.getElementById("calEmpty").hidden = false; return; }

    calEmbed.innerHTML = '<div class="cal-loading"><span class="ar">جارٍ تحميل التقويم…</span><span class="en">Loading calendar…</span></div>';
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);
    var s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = function () {
      calEmbed.innerHTML = "";
      calEmbed.classList.add("loaded");
      var url = CALENDLY_URL + (CALENDLY_URL.indexOf("?") > -1 ? "&" : "?") +
        "hide_gdpr_banner=1&primary_color=0f4c45";
      window.Calendly.initInlineWidget({ url: url, parentElement: calEmbed });
    };
    s.onerror = function () {
      calEmbed.innerHTML = "";
      document.getElementById("calEmpty").hidden = false;
    };
    document.body.appendChild(s);
  }

  // Load the calendar only when the booking section comes near the screen
  if (!CALENDLY_URL) {
    showTab("msg"); // no calendar yet: open on the message form
  } else if ("IntersectionObserver" in window) {
    var calIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !panelCal.hidden) { loadCalendly(); calIO.disconnect(); }
    }, { rootMargin: "400px 0px" });
    calIO.observe(panelCal);
  } else {
    loadCalendly();
  }

  // Thank-you note after a booking is made inside Calendly
  window.addEventListener("message", function (e) {
    if (e.origin === "https://calendly.com" && e.data && e.data.event === "calendly.event_scheduled") {
      var note = panelCal.querySelector(".cal-note");
      note.innerHTML = current() === "ar"
        ? "✅ تمّ الحجز! ستصلك رسالة تأكيد على بريدك الإلكتروني."
        : "✅ Booked! A confirmation email is on its way.";
    }
  });

  /* ---------- Service cards -> preselect form ---------- */
  var serviceSelect = document.getElementById("f-service");

  // Every "book / free session" button preselects the free first session
  document.querySelectorAll('a[href="#book"]').forEach(function (a) {
    a.addEventListener("click", function () {
      serviceSelect.value = "free";
      serviceSelect.dispatchEvent(new Event("change"));
    });
  });
  document.querySelectorAll("[data-service]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showTab("msg");
      serviceSelect.value = btn.dataset.service;
      serviceSelect.dispatchEvent(new Event("change"));
      document.getElementById("book").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { document.getElementById("f-name").focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
  });

  /* ---------- Social links ---------- */
  var ICONS = {
    whatsapp: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/>',
    email: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M3 6h18v12H3zM3 7l9 6 9-6"/>',
    instagram: '<g fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></g><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/>',
    facebook: '<path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z"/>',
    linkedin: '<path fill="currentColor" d="M4.5 9h3.6v11H4.5zM6.3 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM10.3 9h3.4v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.7 0 4.3 2.4 4.3 5.4V20h-3.6v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20h-3.6z"/>',
    youtube: '<path fill="currentColor" fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/>',
    tiktok: '<path fill="currentColor" d="M16.6 3c.3 2.2 1.7 3.7 3.9 3.9v3.2a7.4 7.4 0 0 1-3.9-1.2v6.4a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.3a2.6 2.6 0 1 0 1.7 2.4V3h3.2Z"/>'
  };
  var NAMES = { whatsapp: "WhatsApp", email: "Email", instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube", tiktok: "TikTok" };
  var links = [["whatsapp", "https://wa.me/" + PHONE]];
  Object.keys(SOCIAL).forEach(function (k) { if (SOCIAL[k]) links.push([k, SOCIAL[k]]); });
  var socialHTML = links.map(function (l) {
    return '<a class="social social-' + l[0] + '" href="' + l[1] + '" target="_blank" rel="noopener"' +
      (l[0] === "whatsapp" ? " data-wa-direct" : "") +
      ' aria-label="' + NAMES[l[0]] + '" title="' + NAMES[l[0]] + '"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      ICONS[l[0]] + "</svg></a>";
  }).join("");
  document.querySelectorAll("[data-socials]").forEach(function (el) { el.innerHTML = socialHTML; });

  // Tell Google about the profiles too (structured data "sameAs")
  // (placeholder home-page links like "https://www.instagram.com/" are skipped)
  var sameAs = Object.keys(SOCIAL).map(function (k) { return SOCIAL[k]; })
    .filter(function (u) { return u && !/^https?:\/\/[^\/]+\/?$/.test(u); });
  var ld = document.querySelector('script[type="application/ld+json"]');
  if (ld && sameAs.length) {
    try {
      var data = JSON.parse(ld.textContent);
      data["@graph"][0].sameAs = sameAs;
      ld.textContent = JSON.stringify(data);
    } catch (e) {}
  }

  /* ---------- Direct WhatsApp links get a greeting ---------- */
  document.querySelectorAll("[data-wa-direct]").forEach(function (a) {
    a.addEventListener("click", function () {
      var msg = current() === "ar"
        ? "مرحباً أستاذ عمر، أودّ حجز الجلسة الأولى المجانية / الاستفسار عن الدروس الخاصة."
        : "Hello Omar, I'd like to book the free first session / ask about private lessons.";
      a.href = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg);
    });
  });

  /* ---------- Booking form ---------- */
  var LABELS = {
    ar: {
      greet: "مرحباً أستاذ عمر، أودّ حجز جلسة / الاستفسار:",
      name: "الاسم", service: "نوع الطلب", level: "المستوى / الصف", mode: "طريقة الجلسة",
      time: "الأوقات المفضّلة", message: "الرسالة", subject: "طلب حجز جلسة – ",
      modes: { online: "عبر الإنترنت", inperson: "حضوري (طرابلس)", group: "مجموعة" }
    },
    en: {
      greet: "Hello Omar, I'd like to book a session / ask a question:",
      name: "Name", service: "Request", level: "Level / grade", mode: "Format",
      time: "Preferred times", message: "Message", subject: "Session request – ",
      modes: { online: "Online", inperson: "In person (Tripoli)", group: "Group" }
    }
  };

  // The free first session is online only: lock the format to "Online" when it's chosen
  function syncMode() {
    var free = serviceSelect.value === "free";
    form.querySelectorAll("input[name=mode]").forEach(function (r) {
      if (free) {
        r.disabled = r.value !== "online";
        if (r.value === "online") r.checked = true;
      } else {
        r.disabled = false;
      }
    });
  }
  serviceSelect.addEventListener("change", syncMode);
  syncMode();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var L = LABELS[current()];
    var nameInput = form.elements.name;
    var err = document.getElementById("formError");
    var name = nameInput.value.trim();

    if (!name) {
      nameInput.classList.add("invalid");
      err.hidden = false;
      nameInput.focus();
      return;
    }
    nameInput.classList.remove("invalid");
    err.hidden = true;

    var serviceText = serviceSelect.options[serviceSelect.selectedIndex].textContent;
    var lines = [L.greet, "", L.name + ": " + name, L.service + ": " + serviceText];
    var level = form.elements.level.value.trim();
    var time = form.elements.time.value.trim();
    var message = form.elements.message.value.trim();
    var mode = form.querySelector("input[name=mode]:checked").value;
    if (level) lines.push(L.level + ": " + level);
    lines.push(L.mode + ": " + L.modes[mode]);
    if (time) lines.push(L.time + ": " + time);
    if (message) lines.push("", L.message + ":", message);
    var text = lines.join("\n");

    window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text), "_blank", "noopener");
  });

  form.elements.name.addEventListener("input", function () {
    this.classList.remove("invalid");
    document.getElementById("formError").hidden = true;
  });

  /* ---------- Privacy note dialog ---------- */
  var privacy = document.getElementById("privacyDialog");
  document.querySelectorAll("[data-privacy]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (privacy.showModal) privacy.showModal(); else privacy.setAttribute("open", "");
      document.body.classList.add("no-scroll");
    });
  });
  function closePrivacy() {
    if (privacy.close) privacy.close(); else privacy.removeAttribute("open");
  }
  privacy.querySelector("[data-close]").addEventListener("click", closePrivacy);
  privacy.addEventListener("click", function (e) { if (e.target === privacy) closePrivacy(); }); // click on backdrop
  privacy.addEventListener("close", function () { document.body.classList.remove("no-scroll"); });

  /* =========================================================
     DARK MODE
     ========================================================= */
  var themeBtn = document.getElementById("themeToggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(t, save) {
    root.setAttribute("data-theme", t);
    if (themeMeta) themeMeta.setAttribute("content", t === "dark" ? "#0e1615" : "#0f4c45");
    themeBtn.setAttribute("aria-pressed", String(t === "dark"));
    if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
  }
  applyTheme(root.getAttribute("data-theme") || "light", false);
  themeBtn.addEventListener("click", function () {
    root.classList.add("theme-anim");
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    setTimeout(function () { root.classList.remove("theme-anim"); }, 450);
  });
  // follow the phone/computer setting until the visitor picks a theme themselves
  var mqDark = window.matchMedia("(prefers-color-scheme: dark)");
  var onSystemTheme = function (e) {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) {}
    if (!saved) applyTheme(e.matches ? "dark" : "light", false);
  };
  if (mqDark.addEventListener) mqDark.addEventListener("change", onSystemTheme);
  else if (mqDark.addListener) mqDark.addListener(onSystemTheme);

  /* =========================================================
     TIME-ZONE HELPER (Tripoli time vs visitor's time)
     ========================================================= */
  var TRIPOLI_TZ = "Asia/Beirut";
  var userTZ = "";
  try { userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}

  function tzOffsetMinutes(tz, date) {
    // minutes ahead of UTC for a given IANA zone
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).formatToParts(date);
    var v = {};
    parts.forEach(function (p) { v[p.type] = p.value; });
    var asUTC = Date.UTC(+v.year, +v.month - 1, +v.day, +v.hour % 24, +v.minute);
    return Math.round((asUTC - date.getTime()) / 60000);
  }
  function fmtTime(tz, date) {
    var loc = current() === "ar" ? "ar-LB-u-nu-latn" : "en-US";
    return new Intl.DateTimeFormat(loc, { timeZone: tz, weekday: "short", hour: "numeric", minute: "2-digit" }).format(date);
  }
  function cityName(tz) {
    var c = tz.split("/").pop() || tz;
    return c.replace(/_/g, " ");
  }
  function renderTZ() {
    var elT = document.getElementById("tzTripoli");
    if (!elT) return;
    var now = new Date();
    try {
      elT.textContent = fmtTime(TRIPOLI_TZ, now);
    } catch (e) { document.getElementById("tzHelper").hidden = true; return; }

    var youRow = document.getElementById("tzYouRow");
    var diffEl = document.getElementById("tzDiff");
    var ar = current() === "ar";
    var diff = userTZ ? (tzOffsetMinutes(TRIPOLI_TZ, now) - tzOffsetMinutes(userTZ, now)) : 0;

    if (!userTZ || diff === 0) {
      youRow.hidden = true;
      diffEl.textContent = ar ? "أنت في نفس توقيت طرابلس." : "You're in the same time zone as Tripoli.";
      return;
    }
    youRow.hidden = false;
    document.getElementById("tzYou").textContent = fmtTime(userTZ, now);
    document.getElementById("tzZone").textContent = "(" + cityName(userTZ) + ")";
    var h = Math.abs(diff) / 60;
    var hTxt = (h % 1 === 0) ? String(h) : h.toFixed(1).replace(/\.0$/, "");
    if (ar) {
      // Arabic number agreement: ساعة واحدة / ساعتين / 3–10 ساعات / 11+ ساعة
      var unit = h === 1 ? "ساعة واحدة" : h === 2 ? "ساعتين" : (h >= 3 && h <= 10 && h % 1 === 0) ? hTxt + " ساعات" : hTxt + " ساعة";
      diffEl.textContent = diff > 0
        ? "طرابلس متقدّمة عليك بـ" + unit + "."
        : "طرابلس متأخّرة عنك بـ" + unit + ".";
    } else {
      var hrs = hTxt + (h === 1 ? " hour" : " hours");
      diffEl.textContent = diff > 0 ? "Tripoli is " + hrs + " ahead of you." : "Tripoli is " + hrs + " behind you.";
    }
  }
  renderTZ();
  setInterval(renderTZ, 20000);

  /* =========================================================
     SHARING (refer a friend + quiz challenge), WhatsApp only
     ========================================================= */
  var canonical = document.querySelector('link[rel="canonical"]');
  function siteURL() {
    if (/^https?:$/.test(location.protocol)) return location.origin + location.pathname;
    return canonical ? canonical.href : "";
  }
  function shareOnWhatsApp(text) {
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
  }
  document.querySelectorAll('[data-share="refer"]').forEach(function (b) {
    b.addEventListener("click", function () {
      var url = siteURL();
      shareOnWhatsApp(current() === "ar"
        ? "تريد أن تتعلّم العربية أو تحسّن مستواك؟ 📚\nالأستاذ عمر السوسي يعطي دروساً خاصة، والجلسة الأولى (30 دقيقة أونلاين) مجانية 👇\n" + url
        : "Want to learn Arabic or improve your level? 📚\nOmar Soussi gives private lessons, and the first session (30 min online) is free 👇\n" + url);
    });
  });
  document.querySelectorAll("[data-copy-link]").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = siteURL();
      var done = function () {
        b.querySelector(".copy-label").hidden = true;
        b.querySelector(".copied-label").hidden = false;
        setTimeout(function () {
          b.querySelector(".copy-label").hidden = false;
          b.querySelector(".copied-label").hidden = true;
        }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
      } else { fallbackCopy(url); done(); }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* =========================================================
     LEVEL QUIZ
     ========================================================= */
  var QUIZ = {
    learner: [
      { q: { ar: "ما اسم هذا الحرف؟", en: "What is the name of this letter?" }, show: "ج", big: true,
        opts: ["جيم · Jīm", "حاء · Ḥāʾ", "خاء · Khāʾ", "عين · ʿAyn"], a: 0,
        why: { ar: "«ج» اسمه جيم، ويشبه الحاء والخاء في الشكل لكن بنقطة واحدة تحته.", en: "«ج» is Jīm: the same shape as Ḥāʾ and Khāʾ, with one dot below." } },
      { q: { ar: "ما معنى كلمة «بَيْت»؟", en: "What does «بَيْت» mean?" }, show: "بَيْت", big: true,
        opts: ["House", "Book", "Door", "Girl"], a: 0, latin: true,
        why: { ar: "«بيت» تعني House. أما Book فهي «كتاب»، وDoor «باب»، وGirl «بنت».", en: "بيت (bayt) = house. Book = كتاب, door = باب, girl = بنت." } },
      { q: { ar: "أيّ جملة تعني “I am a student”؟", en: "Which sentence means “I am a student”?" },
        opts: ["أنا طالبٌ", "أنتَ طالبٌ", "هو طالبٌ", "نحن طلّابٌ"], a: 0,
        why: { ar: "«أنا» ضمير المتكلّم. «أنتَ» للمخاطَب، «هو» للغائب، «نحن» للجماعة.", en: "أنا = I. أنتَ = you, هو = he, نحن = we." } },
      { q: { ar: "ما جمع كلمة «كِتاب»؟", en: "What is the plural of «كِتاب» (book)?" },
        opts: ["كُتُب", "كِتابان", "كاتِب", "مَكتَبة"], a: 0,
        why: { ar: "«كُتُب» هو الجمع. «كتابان» مثنّى، «كاتب» من يكتب، «مكتبة» مكان الكتب.", en: "كُتُب is the plural. كتابان = two books, كاتب = writer, مكتبة = library." } },
      { q: { ar: "أكمل الفراغ بالكلمة المناسبة:", en: "Fill in the blank:" }, show: "ذهبتُ ____ المدرسةِ",
        opts: ["إلى", "لكنْ", "هل", "ثُمَّ"], a: 0,
        why: { ar: "«إلى» حرف جرّ يدلّ على الاتجاه: ذهبتُ إلى المدرسةِ.", en: "إلى (to) is the preposition: ذهبتُ إلى المدرسةِ = I went to school." } },
      { q: { ar: "أيّ جملة صحيحة نحوياً؟", en: "Which sentence is grammatically correct?" },
        opts: ["هذه سيارةٌ جميلةٌ", "هذا سيارةٌ جميلٌ", "هذه سيارةٌ جميلٌ", "هذا سيارةٌ جميلةٌ"], a: 0,
        why: { ar: "«سيارة» مؤنّثة، فيجب أن يكون اسم الإشارة «هذه» والصفة «جميلة» مؤنّثين.", en: "سيارة is feminine, so both هذه and the adjective جميلة must be feminine too." } }
    ],
    native: [
      { q: { ar: "ما إعراب كلمة «الطالبُ» في الجملة؟", en: "What is the iʿrāb of «الطالبُ» in this sentence?" }, show: "نجحَ الطالبُ في الامتحانِ",
        opts: ["فاعلٌ مرفوعٌ", "مبتدأٌ مرفوعٌ", "مفعولٌ به منصوبٌ", "خبرٌ مرفوعٌ"], a: 0,
        why: { ar: "«الطالبُ» فاعل مرفوع وعلامة رفعه الضمّة، لأنه مَن قام بفعل «نجح».", en: "It's the fāʿil (subject) of the verb نجح, so it's marfūʿ with a ḍamma." } },
      { q: { ar: "اختر الجملة الصحيحة:", en: "Choose the correct sentence:" },
        opts: ["إنّ المعلّمَ مجتهدٌ", "إنّ المعلّمُ مجتهدٌ", "إنّ المعلّمَ مجتهداً", "إنّ المعلّمُ مجتهداً"], a: 0,
        why: { ar: "«إنّ» تنصب الاسم (المعلّمَ) وترفع الخبر (مجتهدٌ).", en: "إنّ makes its noun manṣūb (المعلّمَ) and its predicate marfūʿ (مجتهدٌ)." } },
      { q: { ar: "ما علامة جزم الفعل في الجملة؟", en: "What marks the verb as majzūm here?" }, show: "لم يكتبْ واجبَهُ",
        opts: ["السكون", "حذف النون", "حذف حرف العلّة", "الفتحة"], a: 0,
        why: { ar: "«لم» حرف جزم، و«يكتبْ» فعل مضارع صحيح الآخر، فيُجزم بالسكون.", en: "لم is a jussive particle and يكتب is a sound verb, so it's majzūm with a sukūn." } },
      { q: { ar: "ما نوع «كان» في الجملة؟", en: "What type of verb is «كان» here?" }, show: "كانَ الجوُّ جميلاً",
        opts: ["فعلٌ ماضٍ ناقصٌ", "فعلٌ ماضٍ تامٌّ", "حرفٌ مشبّهٌ بالفعل", "فعلُ أمرٍ"], a: 0,
        why: { ar: "«كان» فعل ماضٍ ناقص ناسخ: رفع «الجوُّ» اسماً له، ونصب «جميلاً» خبراً له.", en: "Here كان is a nāqiṣ (incomplete) verb: الجوُّ is its noun and جميلاً its predicate." } },
      { q: { ar: "اختر الكتابة الصحيحة:", en: "Choose the correct spelling:" },
        opts: ["شاطِئ", "شاطيء", "شاطأ", "شاطؤ"], a: 0,
        why: { ar: "الهمزة متطرّفة وما قبلها مكسور، فتُكتب على نبرة: شاطِئ.", en: "A final hamza after a kasra is written on a yāʾ seat (ئ): شاطِئ." } },
      { q: { ar: "ما الصورة البيانية في هذه العبارة؟", en: "What figure of speech is this?" }, show: "العلمُ نورٌ",
        opts: ["تشبيهٌ بليغٌ", "استعارةٌ مكنيّةٌ", "كنايةٌ", "طباقٌ"], a: 0,
        why: { ar: "شُبّه العلم بالنور مع حذف الأداة ووجه الشبه، فهو تشبيه بليغ.", en: "Knowledge is likened to light with both the particle and the point of comparison dropped: tashbīh balīgh." } }
    ]
  };
  var BANDS = {
    learner: [
      { max: 1, ar: "مبتدئ", en: "Beginner",
        adv: { ar: "سنبدأ معاً بالحروف والأصوات وأولى الكلمات، خطوة بخطوة.", en: "We'll start with the alphabet, sounds and your first words, step by step." } },
      { max: 3, ar: "أساسي", en: "Elementary",
        adv: { ar: "لديك الأساسيات. الخطوة التالية: القواعد الأساسية، مفردات الحياة اليومية، والقراءة البسيطة.", en: "You know the basics. Next: core grammar, everyday vocabulary and simple reading." } },
      { max: 5, ar: "متوسّط", en: "Intermediate",
        adv: { ar: "مستوى جيد! سنعمل على الطلاقة: نصوص أطول، محادثة، ودقّة في القواعد.", en: "Good level! We'll build fluency: longer texts, conversation and accurate grammar." } },
      { max: 6, ar: "متقدّم", en: "Advanced",
        adv: { ar: "ممتاز! سنركّز على التفاصيل الدقيقة: قراءة نصوص أصيلة، الكتابة، والتحدّث بطلاقة.", en: "Excellent! We'll work on nuance: authentic texts, writing and fluent speaking." } }
    ],
    native: [
      { max: 2, ar: "تحتاج إلى تأسيس", en: "Needs a stronger foundation",
        adv: { ar: "سنعيد بناء أساسيات القواعد والإعراب بقواعد واضحة وتمارين كثيرة.", en: "We'll rebuild the basics of grammar and iʿrāb with clear rules and plenty of practice." } },
      { max: 4, ar: "مستوى جيد", en: "Good level",
        adv: { ar: "لديك الأساس. سنسدّ الثغرات في الإعراب والإملاء والبلاغة قبل الامتحانات.", en: "You have the basics. We'll fill the gaps in iʿrāb, spelling and rhetoric before exams." } },
      { max: 5, ar: "جيد جداً", en: "Very good",
        adv: { ar: "مستوى قوي! بضع جلسات مركّزة ستجعل إجاباتك كاملة في الامتحان.", en: "Strong level! A few focused sessions will make your exam answers perfect." } },
      { max: 6, ar: "ممتاز", en: "Excellent",
        adv: { ar: "ممتاز! يمكننا التركيز على التحليل المتقدّم والكتابة والتفوّق في الامتحانات.", en: "Excellent! We can focus on advanced analysis, writing and top exam results." } }
    ]
  };

  var quizEl = document.getElementById("quiz-app");
  var qs = { track: null, list: [], i: 0, score: 0, answers: [] };
  // Isolate Arabic runs inside English text (and Latin runs inside Arabic) so «quotes» and order don't flip
  function isoAr(t) { return String(t).replace(/[؀-ۿ](?:[؀-ۿً-ٰٟ ]*[؀-ۿً-ٰٟ])?/g, function (m) { return '<bdi dir="rtl">' + m + "</bdi>"; }); }
  function isoEn(t) { return String(t).replace(/[A-Za-zÀ-ɏʾʿḀ-ỿ](?:[A-Za-zÀ-ɏʾʿḀ-ỿ' ]*[A-Za-zÀ-ɏʾʿḀ-ỿ])?/g, function (m) { return '<bdi dir="ltr">' + m + "</bdi>"; }); }
  function bi(o) { return '<span class="ar">' + isoEn(o.ar) + '</span><span class="en">' + isoAr(o.en) + "</span>"; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(arr) {
    for (var k = arr.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = arr[k]; arr[k] = arr[j]; arr[j] = t; }
    return arr;
  }
  function screen(name) {
    quizEl.querySelectorAll(".quiz-screen").forEach(function (s) { s.hidden = s.dataset.screen !== name; });
  }
  function startQuiz(track) {
    qs.track = track;
    qs.list = QUIZ[track].map(function (q) {
      // shuffle options but remember which one is right
      var order = shuffle(q.opts.map(function (_, idx) { return idx; }));
      return { src: q, order: order };
    });
    qs.i = 0; qs.score = 0; qs.answers = [];
    screen("question");
    renderQuestion();
    quizEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  function renderQuestion() {
    var item = qs.list[qs.i], q = item.src, total = qs.list.length;
    document.getElementById("quizCount").innerHTML =
      '<span class="ar">السؤال ' + (qs.i + 1) + " من " + total + '</span><span class="en">Question ' + (qs.i + 1) + " of " + total + "</span>";
    document.getElementById("quizBar").style.width = ((qs.i) / total * 100) + "%";
    document.getElementById("quizQ").innerHTML =
      '<div class="q-text">' + bi(q.q) + "</div>" +
      (q.show ? '<span class="q-ar' + (q.big ? " big" : "") + '">' + esc(q.show) + "</span>" : "");
    var keys = ["A", "B", "C", "D"];
    var box = document.getElementById("quizOptions");
    box.innerHTML = item.order.map(function (origIdx, pos) {
      return '<button type="button" class="quiz-opt" data-orig="' + origIdx + '">' +
        '<span class="opt-key">' + keys[pos] + "</span>" +
        '<bdi class="' + (q.latin ? "" : "opt-ar") + '">' + esc(q.opts[origIdx]) + "</bdi></button>";
    }).join("");
    var fb = document.getElementById("quizFeedback");
    fb.className = "quiz-feedback"; fb.innerHTML = "";
    document.getElementById("quizNext").hidden = true;
    var first = box.querySelector(".quiz-opt");
    if (first && qs.i > 0) first.focus({ preventScroll: true });
  }
  function answer(btn) {
    var item = qs.list[qs.i], q = item.src;
    var chosen = +btn.dataset.orig, ok = chosen === q.a;
    if (ok) qs.score++;
    qs.answers.push({ q: q, chosen: chosen, ok: ok });
    document.querySelectorAll("#quizOptions .quiz-opt").forEach(function (b) {
      b.disabled = true;
      var o = +b.dataset.orig;
      if (o === q.a) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    var fb = document.getElementById("quizFeedback");
    fb.className = "quiz-feedback " + (ok ? "ok" : "no");
    fb.innerHTML = (ok ? bi({ ar: "✓ إجابة صحيحة!", en: "✓ Correct!" }) : bi({ ar: "✗ ليست هذه الإجابة", en: "✗ Not quite" })) +
      "<small>" + bi(q.why) + "</small>";
    var next = document.getElementById("quizNext");
    var last = qs.i === qs.list.length - 1;
    next.innerHTML = last ? bi({ ar: "اعرض نتيجتي", en: "See my result" }) : bi({ ar: "السؤال التالي ←", en: "Next question →" });
    next.hidden = false;
    next.focus({ preventScroll: true });
  }
  function showResult() {
    screen("result");
    document.getElementById("quizBar").style.width = "100%";
    var total = qs.list.length, s = qs.score;
    var band = BANDS[qs.track].filter(function (b) { return s <= b.max; })[0];
    qs.band = band;
    document.getElementById("quizScoreText").textContent = s + "/" + total;
    document.getElementById("quizLevel").innerHTML = bi(band);
    document.getElementById("quizAdvice").innerHTML = bi(band.adv);
    var ring = document.getElementById("quizRing");
    ring.style.strokeDashoffset = 326.7;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      ring.style.strokeDashoffset = 326.7 * (1 - s / total);
    }); });
    document.getElementById("quizReview").innerHTML = qs.answers.map(function (a) {
      return "<li><b>" + bi(a.q.q) + "</b>" + (a.q.show ? ' <bdi class="ar-inline" dir="rtl">' + esc(a.q.show) + "</bdi>" : "") + "<br>" +
        (a.ok
          ? '<span class="rv-ok">✓ <bdi>' + esc(a.q.opts[a.q.a]) + "</bdi></span>"
          : '<span class="rv-no">✗ <bdi>' + esc(a.q.opts[a.chosen]) + "</bdi></span>" +
            ' <span class="rv-arrow">' + bi({ ar: "← الصحيح:", en: "→ correct:" }) + '</span> <span class="rv-ok"><bdi>' + esc(a.q.opts[a.q.a]) + "</bdi></span>") +
        "</li>";
    }).join("");
    quizEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  quizEl.querySelectorAll("[data-track]").forEach(function (b) {
    b.addEventListener("click", function () { startQuiz(b.dataset.track); });
  });
  document.getElementById("quizOptions").addEventListener("click", function (e) {
    var b = e.target.closest(".quiz-opt");
    if (b && !b.disabled) answer(b);
  });
  document.getElementById("quizNext").addEventListener("click", function () {
    if (qs.i < qs.list.length - 1) { qs.i++; renderQuestion(); }
    else showResult();
  });
  quizEl.querySelectorAll("[data-restart]").forEach(function (b) {
    b.addEventListener("click", function () { screen("start"); document.getElementById("quizBar").style.width = "0"; });
  });
  // keyboard shortcuts A–D / 1–4 while a question is open
  document.addEventListener("keydown", function (e) {
    if (quizEl.querySelector('[data-screen="question"]').hidden) return;
    if (e.target.matches("input, textarea, select")) return;
    var map = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
    var idx = map[(e.key || "").toLowerCase()];
    if (idx === undefined) return;
    var opts = document.querySelectorAll("#quizOptions .quiz-opt");
    if (opts[idx] && !opts[idx].disabled) answer(opts[idx]);
  });

  // "Book your free session" from the result: prefill the form with the quiz result
  document.getElementById("quizBook").addEventListener("click", function () {
    var b = qs.band; if (!b) return;
    var total = qs.list.length;
    var trackTxt = qs.track === "native"
      ? { ar: "العربية لغتي الأم", en: "Arabic is my first language" }
      : { ar: "أتعلّم العربية", en: "I'm learning Arabic" };
    var lang = current();
    form.elements.level.value = b[lang];
    form.elements.message.value = lang === "ar"
      ? "نتيجتي في اختبار المستوى: " + qs.score + "/" + total + " (" + b.ar + "، " + trackTxt.ar + ")."
      : "My level-quiz result: " + qs.score + "/" + total + " (" + b.en + ", " + trackTxt.en + ").";
    showTab("msg");
  });
  // "Challenge a friend" from the result
  document.querySelectorAll('[data-share="quiz"]').forEach(function (b) {
    b.addEventListener("click", function () {
      var url = siteURL() + "#quiz", total = qs.list.length;
      shareOnWhatsApp(current() === "ar"
        ? "حصلتُ على " + qs.score + "/" + total + " في اختبار مستوى العربية 🎯 هل تستطيع أن تتفوّق عليّ؟ جرّبه هنا 👇\n" + url
        : "I scored " + qs.score + "/" + total + " on this Arabic level quiz 🎯 Can you beat me? Try it here 👇\n" + url);
    });
  });

  // re-render time strings when the language changes
  document.getElementById("langToggle").addEventListener("click", function () { renderTZ(); });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
