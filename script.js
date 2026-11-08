(function () {
  "use strict";

  var PHONE = "96171752289";
  var EMAIL = "omarsoussi609@gmail.com";
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

  /* ---------- Service cards -> preselect form ---------- */
  var form = document.getElementById("bookForm");
  var serviceSelect = document.getElementById("f-service");
  document.querySelectorAll("[data-service]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      serviceSelect.value = btn.dataset.service;
      serviceSelect.dispatchEvent(new Event("change"));
      document.getElementById("book").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { document.getElementById("f-name").focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
  });

  /* ---------- Direct WhatsApp links get a greeting ---------- */
  document.querySelectorAll("[data-wa-direct]").forEach(function (a) {
    a.addEventListener("click", function () {
      var msg = current() === "ar"
        ? "مرحباً أستاذ عمر، أودّ الاستفسار عن الدروس الخاصة."
        : "Hello Omar, I'd like to ask about private lessons.";
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

  var lastChannel = "wa";
  form.querySelectorAll("button[type=submit]").forEach(function (b) {
    b.addEventListener("click", function () { lastChannel = b.dataset.channel; });
  });

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

    if (lastChannel === "email") {
      location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(L.subject + name) +
        "&body=" + encodeURIComponent(text);
    } else {
      window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  });

  form.elements.name.addEventListener("input", function () {
    this.classList.remove("invalid");
    document.getElementById("formError").hidden = true;
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
