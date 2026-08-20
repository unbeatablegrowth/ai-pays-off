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

  function initPathfinder() {
    if (document.querySelector("[data-fm-pathfinder]")) return;

    var page = document.body.dataset.fmPage || "support";
    var storageKey = "futuremakers-pathfinder-open";
    var routes = {
      start: {
        eyebrow: "FutureMakers Guide",
        title: "What would be most useful right now?",
        copy: "Choose the closest answer. I’ll point you toward one practical next step.",
        choices: [
          ["Build something I can sell", "build"],
          ["Create videos without being on camera", "creator"],
          ["I’m not sure where to begin", "unsure"],
          ["I already purchased and need help", "support"]
        ]
      },
      build: {
        eyebrow: "Build an owned asset",
        title: "How far along are you?",
        copy: "You do not need a perfect business idea. Start from the clearest obstacle in front of you.",
        choices: [
          ["I need to choose an idea", "free"],
          ["I have an idea but no offer", "blueprint"],
          ["I have an offer but need customers", "blueprint"],
          ["Go back", "start"]
        ]
      },
      unsure: {
        eyebrow: "Start with evidence",
        title: "You only need one believable first step.",
        copy: "Use the free checklist to identify what you know, who it could help, and the smallest useful thing you could build. No purchase is required.",
        actions: [
          ["Start with the free checklist", "https://ai-pays-off.kit.com/e182e1d4fc", "primary"],
          ["Explore the free tools", "/ai-pays-off/tools", "secondary"]
        ],
        choices: [["Show me the other paths", "start"]]
      },
      free: {
        eyebrow: "Your first step",
        title: "Find the useful idea hiding in what you already know.",
        copy: "The free checklist helps you move from scattered possibilities to one idea worth testing.",
        actions: [["Get the free checklist", "https://ai-pays-off.kit.com/e182e1d4fc", "primary"]],
        choices: [["I want the complete build path", "blueprint"], ["Go back", "build"]]
      },
      blueprint: {
        eyebrow: "A.I. Pays Off Blueprint",
        title: "Turn the idea into something people can actually buy.",
        copy: "The $47 Blueprint guides you from problem and offer to product page and live payment path. It is a practical sequence, not a promise of guaranteed income.",
        actions: [
          ["See what’s included", "/#blueprint", "secondary"],
          ["Get the Blueprint — $47", "https://buy.stripe.com/14A5kDfYdh09aqFdKFeZ20b", "primary"]
        ],
        choices: [["I need video content instead", "creator"], ["Go back", "build"]]
      },
      creator: {
        eyebrow: "AI Personal Creator",
        title: "Show up consistently without living on camera.",
        copy: "FutureMakers builds your AI spokesperson and your first 10 pieces of video content. Review the real showcase and service details before deciding whether it fits.",
        actions: [["Watch the showcase", "/ai-personal-creator", "primary"]],
        choices: [["I want to build my own product", "build"], ["Go back", "start"]]
      },
      support: {
        eyebrow: "Customer support",
        title: "Let’s get you unstuck.",
        copy: "For access, delivery, billing, or project questions, email support and include the email address used at checkout. Never send a password or private account credential.",
        actions: [["Email support", "mailto:support@futuremakers.dev?subject=FutureMakers%20Support", "primary"]],
        choices: [["I have a question before buying", "start"]]
      }
    };

    var root = document.createElement("aside");
    root.className = "fm-pathfinder";
    root.dataset.fmPathfinder = "";
    root.innerHTML =
      '<button class="fm-pathfinder__launcher" type="button" aria-expanded="false" aria-controls="fm-pathfinder-panel">' +
        '<span class="fm-pathfinder__pulse" aria-hidden="true"></span>' +
        '<span><strong>Find your next step</strong><small>FutureMakers Guide</small></span>' +
      '</button>' +
      '<section class="fm-pathfinder__panel" id="fm-pathfinder-panel" aria-label="FutureMakers path guide" aria-hidden="true">' +
        '<header class="fm-pathfinder__header"><div><span class="fm-pathfinder__status" aria-hidden="true"></span><strong>FutureMakers Guide</strong><small>Automated pathfinder</small></div><button type="button" class="fm-pathfinder__close" aria-label="Close guide">×</button></header>' +
        '<div class="fm-pathfinder__body" aria-live="polite"></div>' +
        '<footer class="fm-pathfinder__footer">Guidance, not an income guarantee · <a href="/privacy">Privacy</a></footer>' +
      '</section>';
    document.body.appendChild(root);

    var launcher = root.querySelector(".fm-pathfinder__launcher");
    var panel = root.querySelector(".fm-pathfinder__panel");
    var close = root.querySelector(".fm-pathfinder__close");
    var body = root.querySelector(".fm-pathfinder__body");

    function render(routeName) {
      var route = routes[routeName] || routes.start;
      var html = '<p class="fm-pathfinder__eyebrow">' + route.eyebrow + '</p>' +
        '<h2>' + route.title + '</h2><p class="fm-pathfinder__copy">' + route.copy + '</p>';
      if (route.actions) {
        html += '<div class="fm-pathfinder__actions">' + route.actions.map(function (action) {
          var external = /^https?:/.test(action[1]);
          return '<a class="fm-pathfinder__action fm-pathfinder__action--' + action[2] + '" href="' + action[1] + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' + action[0] + '</a>';
        }).join("") + '</div>';
      }
      if (route.choices) {
        html += '<div class="fm-pathfinder__choices">' + route.choices.map(function (choice) {
          return '<button type="button" data-fm-route="' + choice[1] + '"><span>' + choice[0] + '</span><span aria-hidden="true">→</span></button>';
        }).join("") + '</div>';
      }
      body.innerHTML = html;
      body.querySelectorAll("[data-fm-route]").forEach(function (button) {
        button.addEventListener("click", function () { render(button.dataset.fmRoute); });
      });
    }

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      launcher.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      try { window.sessionStorage.setItem(storageKey, open ? "1" : "0"); } catch (error) {}
      if (open) {
        render(page === "support" ? "support" : "start");
        window.setTimeout(function () { close.focus(); }, 20);
      } else {
        launcher.focus();
      }
    }

    launcher.addEventListener("click", function () { setOpen(true); });
    close.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.classList.contains("is-open")) setOpen(false);
    });
    render(page === "support" ? "support" : "start");
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

    initPathfinder();

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
