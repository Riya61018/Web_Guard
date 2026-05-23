// SafeGuard Content Script — runs at document_start on every page
(async () => {
  const hostname = location.hostname.replace(/^www\./i, "").toLowerCase();

  // Skip empty, local, and extension pages
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return;
  if (location.protocol === "chrome-extension:" || location.protocol === "moz-extension:") return;

  // Load configuration from storage
  let settings;
  try {
    settings = await chrome.storage.sync.get({ apiUrl: "", profileId: "" });
  } catch {
    return;
  }

  if (!settings.apiUrl || !settings.profileId) return; // not configured yet

  // Hide page while we check so there's no flash of blocked content
  document.documentElement.style.visibility = "hidden";

  try {
    const checkUrl =
      settings.apiUrl.replace(/\/$/, "") +
      "/api/check?domain=" +
      encodeURIComponent(hostname) +
      "&profileId=" +
      encodeURIComponent(settings.profileId);

    const res = await fetch(checkUrl, { signal: AbortSignal.timeout(4000) });

    if (res.ok) {
      const data = await res.json();
      if (data.blocked) {
        location.replace(
          chrome.runtime.getURL(
            "blocked.html?domain=" +
              encodeURIComponent(hostname) +
              "&category=" +
              encodeURIComponent(data.category || "")
          )
        );
        return; // keep page hidden while redirecting
      }
    }
  } catch {
    // API unreachable — fail open (show the page)
  }

  document.documentElement.style.visibility = "";
})();
