(function () {
  "use strict";

  var SUPABASE_URL = "https://zuqmokdsvbwaolqkwask.supabase.co";
  var SUPABASE_KEY = "sb_publishable_r1hMPLW3vAKDJonqwk-fYw_l_351M9k";
  var client = window.supabase && window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  function safeNext() {
    var value = new URLSearchParams(window.location.search).get("next") || "/free-hub";
    return value.startsWith("/") && !value.startsWith("//") ? value : "/free-hub";
  }

  function setMessage(message, kind) {
    var output = document.querySelector("[data-auth-message]");
    if (!output) return;
    output.textContent = message || "";
    output.dataset.kind = kind || "info";
  }

  async function redirectIfSignedIn() {
    if (!client || document.body.dataset.authPage !== "login") return;
    var result = await client.auth.getSession();
    if (result.data.session) window.location.replace(safeNext());
  }

  async function signInWithOAuth(provider) {
    if (!client) return setMessage("Account connection is unavailable. Please try again shortly.", "error");
    setMessage("Opening secure sign-in…", "info");
    var callback = window.location.origin + "/auth-callback?next=" + encodeURIComponent(safeNext());
    var result = await client.auth.signInWithOAuth({ provider: provider, options: { redirectTo: callback } });
    if (result.error) setMessage(result.error.message, "error");
  }

  async function sendMagicLink(event) {
    event.preventDefault();
    if (!client) return setMessage("Account connection is unavailable. Please try again shortly.", "error");
    var form = event.currentTarget;
    var email = String(new FormData(form).get("email") || "").trim();
    if (!email) return setMessage("Enter your email address first.", "error");
    var button = form.querySelector("button[type='submit']");
    var originalLabel = button.textContent;
    button.disabled = true;
    button.classList.remove("is-sent");
    button.textContent = "Sending secure link…";
    setMessage("Sending your secure sign-in link…", "info");
    var callback = window.location.origin + "/auth-callback?next=" + encodeURIComponent(safeNext());
    var result = await client.auth.signInWithOtp({ email: email, options: { emailRedirectTo: callback, shouldCreateUser: true } });
    if (result.error) {
      button.disabled = false;
      button.textContent = originalLabel;
      return setMessage(result.error.message, "error");
    }
    form.reset();
    button.classList.add("is-sent");
    button.textContent = "Sign-in link sent — check your email ✓";
    setMessage("Check your email. Your secure sign-in link is on its way.", "success");
    window.setTimeout(function () {
      button.disabled = false;
      button.classList.remove("is-sent");
      button.textContent = "Send another sign-in link";
    }, 30000);
  }

  async function finishCallback() {
    if (!client || document.body.dataset.authPage !== "callback") return;
    setMessage("Confirming your account…", "info");
    var result = await client.auth.getSession();
    if (result.error || !result.data.session) {
      setMessage("We could not confirm this sign-in. Return to login and try again.", "error");
      return;
    }
    window.location.replace(safeNext());
  }

  async function requireSession() {
    if (!client || document.body.dataset.authPage !== "hub") return null;
    var result = await client.auth.getSession();
    if (!result.data.session) {
      window.location.replace("/login?next=" + encodeURIComponent(window.location.pathname));
      return null;
    }
    var user = result.data.session.user;
    var metadata = user.user_metadata || {};
    var displayName = metadata.full_name || metadata.name || metadata.user_name || metadata.preferred_username || "";
    if (!displayName && user.email) displayName = user.email.split("@")[0];
    displayName = String(displayName || "FutureMaker").trim().split(/\s+/)[0];
    document.querySelectorAll("[data-user-name]").forEach(function (node) {
      node.textContent = displayName;
    });
    document.documentElement.classList.add("fm-auth-ready");
    return { client: client, user: user };
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    window.location.replace("/");
  }

  document.querySelectorAll("[data-oauth-provider]").forEach(function (button) {
    button.addEventListener("click", function () { signInWithOAuth(button.dataset.oauthProvider); });
  });
  var magicForm = document.querySelector("[data-magic-link-form]");
  if (magicForm) magicForm.addEventListener("submit", sendMagicLink);
  document.querySelectorAll("[data-sign-out]").forEach(function (button) { button.addEventListener("click", signOut); });

  window.FutureMakersAuth = { client: client, requireSession: requireSession };
  redirectIfSignedIn();
  finishCallback();
})();
