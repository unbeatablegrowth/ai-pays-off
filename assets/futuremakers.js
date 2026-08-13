(function () {
  "use strict";

  function classifyPage(pathname) {
    if (pathname === "/" || pathname.endsWith("/index.html") && !pathname.includes("/blog/") && !pathname.includes("/ai-pays-off/")) return "home";
    if (pathname === "/blog/" || pathname.endsWith("/blog/index.html")) return "blog";
    if (pathname.includes("/blog/")) return "article";
    if (pathname.endsWith("/ai-pays-off/tools") || pathname.endsWith("/ai-pays-off/tools.html")) return "tools";
    if (/\/(market-validator|offer-angle-finder|prd-tool)(\.html)?$/.test(pathname)) return "tool";
    if (pathname.endsWith("/ai-pays-off/blueprint") || pathname.endsWith("/ai-pays-off/blueprint.html")) return "blueprint";
    if (pathname === "/ai-pays-off/" || pathname.endsWith("/ai-pays-off/index.html")) return "sales";
    return "support";
  }

  function normalizePath(pathname) {
    var normalized = pathname.replace(/index\.html$/, "").replace(/\.html$/, "");
    if (normalized.length > 1) normalized = normalized.replace(/\/$/, "");
    return normalized || "/";
  }

  function enhance() {
    var body = document.body;
    if (!body) return;

    body.dataset.fmPage = classifyPage(window.location.pathname);

    if (!document.querySelector("link[rel~='icon']")) {
      var favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/jpeg";
      favicon.href = "/ai-pays-off/logo.jpg";
      document.head.appendChild(favicon);
    }

    var main = document.querySelector("main");
    if (!main) {
      main = document.querySelector("body > section, body > header + section");
    }

    if (main) {
      if (!main.id) main.id = "main-content";
      if (main.tagName !== "MAIN") {
        main.setAttribute("role", "main");
        main.setAttribute("tabindex", "-1");
      }
      var skip = document.createElement("a");
      skip.className = "fm-skip-link";
      skip.href = "#" + main.id;
      skip.textContent = "Skip to content";
      body.insertBefore(skip, body.firstChild);
    }

    var currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll("nav a[href]").forEach(function (link) {
      try {
        if (link.getAttribute("href").startsWith("#")) return;
        var url = new URL(link.href, window.location.origin);
        if (url.origin === window.location.origin && normalizePath(url.pathname) === currentPath) {
          link.setAttribute("aria-current", "page");
        }
      } catch (error) {
        // Invalid third-party URLs are ignored without affecting navigation.
      }
    });

    document.querySelectorAll("label:not([for])").forEach(function (label) {
      var field = label.parentElement && label.parentElement.querySelector("input[id], select[id], textarea[id]");
      if (field) label.htmlFor = field.id;
    });

    document.querySelectorAll("#outputSection, [id$='Output']").forEach(function (output) {
      output.setAttribute("aria-live", "polite");
    });

    document.querySelectorAll("iframe[data-youtube-src]").forEach(function (iframe) {
      var wrapper = iframe.parentElement;
      if (!wrapper) return;

      var launchButton = document.createElement("button");
      launchButton.type = "button";
      launchButton.className = "fm-video-launch";
      launchButton.setAttribute("aria-label", "Play the walkthrough: " + (iframe.title || "video"));

      var poster = document.createElement("img");
      poster.src = body.dataset.fmPage === "sales"
        ? "/assets/ai-pays-off-sequence.jpg"
        : "/assets/futuremakers-workbench.jpg";
      poster.alt = "";
      poster.width = 1020;
      poster.height = 680;
      poster.decoding = "async";

      var label = document.createElement("span");
      label.textContent = "Play the walkthrough";

      launchButton.appendChild(poster);
      launchButton.appendChild(label);
      wrapper.replaceChild(launchButton, iframe);

      launchButton.addEventListener("click", function () {
        iframe.src = iframe.dataset.youtubeSrc;
        iframe.loading = "eager";
        wrapper.replaceChild(iframe, launchButton);
      }, { once: true });
    });

    var revealTargets = Array.from(document.querySelectorAll(
      "body > section, main > header, main > section, main > article, main > article > section"
    )).filter(function (element, index, collection) {
      return !collection.some(function (candidate) {
        return candidate !== element && candidate.contains(element);
      });
    });

    revealTargets.forEach(function (element) {
      element.setAttribute("data-fm-reveal", "");
    });

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealTargets.forEach(function (element) { element.classList.add("fm-in-view"); });
      return;
    }

    document.documentElement.classList.add("fm-motion-ready");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("fm-in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    revealTargets.forEach(function (element) { observer.observe(element); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance, { once: true });
  } else {
    enhance();
  }
})();
