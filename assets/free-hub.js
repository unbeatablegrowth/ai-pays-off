(function () {
  "use strict";

  var fallbackResources = [
    { slug: "ai-income-checklist", title: "AI Income Path Checklist", description: "Identify what you know, who it can help, and the first useful offer you can test.", category: "Start here", resource_url: "/free-checklist", action_label: "Open the checklist" },
    { slug: "futuremakers-tools", title: "FutureMakers Free Tools", description: "Use practical tools to examine a market, shape an offer, and turn an idea into a buildable plan.", category: "Build", resource_url: "/ai-pays-off/tools", action_label: "Explore the tools" },
    { slug: "ai-personal-creator", title: "AI Spokesperson Showcase", description: "See how a consistent AI spokesperson and video-content system can work for a real business.", category: "Create", resource_url: "/ai-personal-creator", action_label: "Watch the showcase" }
  ];

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function render(resources, progress) {
    var grid = document.querySelector("[data-resource-grid]");
    if (!grid) return;
    grid.innerHTML = resources.map(function (resource) {
      var complete = progress.has(resource.slug);
      return '<article class="fm-resource-card" data-resource="' + escapeHtml(resource.slug) + '">' +
        '<div class="fm-resource-card__top"><span>' + escapeHtml(resource.category || "Guide") + '</span><span class="fm-resource-status">' + (complete ? "Completed" : "Ready") + '</span></div>' +
        '<h2>' + escapeHtml(resource.title) + '</h2><p>' + escapeHtml(resource.description) + '</p>' +
        '<div class="fm-resource-card__actions"><a href="' + escapeHtml(resource.resource_url) + '" data-open-resource="' + escapeHtml(resource.slug) + '">' + escapeHtml(resource.action_label || "Open resource") + '</a>' +
        '<button type="button" data-complete-resource="' + escapeHtml(resource.slug) + '">' + (complete ? "Completed ✓" : "Mark complete") + '</button></div></article>';
    }).join("");
    updateProgress(resources.length, progress.size);
  }

  function updateProgress(total, complete) {
    var percent = total ? Math.round((complete / total) * 100) : 0;
    document.querySelectorAll("[data-progress-count]").forEach(function (node) { node.textContent = complete + " of " + total; });
    document.querySelectorAll("[data-progress-bar]").forEach(function (node) { node.style.width = percent + "%"; });
  }

  async function start() {
    if (!window.FutureMakersAuth) return;
    var auth = await window.FutureMakersAuth.requireSession();
    if (!auth) return;
    var resources = fallbackResources;
    var progress = new Set();
    var resourceResult = await auth.client.from("resources").select("slug,title,description,category,resource_url,action_label").eq("is_published", true).order("sort_order");
    if (!resourceResult.error && resourceResult.data && resourceResult.data.length) resources = resourceResult.data;
    var progressResult = await auth.client.from("resource_progress").select("resource_slug").eq("user_id", auth.user.id).eq("completed", true);
    if (!progressResult.error) (progressResult.data || []).forEach(function (row) { progress.add(row.resource_slug); });
    render(resources, progress);

    document.addEventListener("click", async function (event) {
      var completeButton = event.target.closest("[data-complete-resource]");
      var openLink = event.target.closest("[data-open-resource]");
      var slug = completeButton ? completeButton.dataset.completeResource : openLink && openLink.dataset.openResource;
      if (!slug) return;
      var values = { user_id: auth.user.id, resource_slug: slug, opened_at: new Date().toISOString() };
      if (completeButton) values.completed = true;
      var result = await auth.client.from("resource_progress").upsert(values, { onConflict: "user_id,resource_slug" });
      if (completeButton && !result.error) {
        progress.add(slug);
        render(resources, progress);
      }
    });
  }

  start();
})();
