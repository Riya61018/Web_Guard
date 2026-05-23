// Load saved settings
chrome.storage.sync.get({ apiUrl: "", profileId: "" }, (data) => {
  document.getElementById("apiUrl").value = data.apiUrl;
  document.getElementById("profileId").value = data.profileId;
});

// Save settings
document.getElementById("save").addEventListener("click", () => {
  const apiUrl = document.getElementById("apiUrl").value.trim().replace(/\/$/, "");
  const profileId = document.getElementById("profileId").value.trim();
  const status = document.getElementById("status");

  if (!apiUrl || !profileId) {
    status.textContent = "Both fields are required.";
    status.className = "status error";
    return;
  }

  chrome.storage.sync.set({ apiUrl, profileId }, () => {
    status.textContent = "Settings saved.";
    status.className = "status";
    setTimeout(() => (status.textContent = ""), 2500);
  });
});

// Test connection
document.getElementById("testBtn").addEventListener("click", async () => {
  const apiUrl = document.getElementById("apiUrl").value.trim().replace(/\/$/, "");
  const profileId = document.getElementById("profileId").value.trim();
  const domain = document.getElementById("testDomain").value.trim().replace(/^www\./i, "");
  const result = document.getElementById("testResult");

  if (!apiUrl || !profileId || !domain) {
    result.textContent = "Fill in API URL, Profile ID, and a test domain first.";
    result.className = "test-result blocked";
    result.style.display = "block";
    return;
  }

  result.textContent = "Checking...";
  result.className = "test-result allowed";
  result.style.display = "block";

  try {
    const res = await fetch(
      `${apiUrl}/api/check?domain=${encodeURIComponent(domain)}&profileId=${encodeURIComponent(profileId)}`
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.blocked) {
      result.textContent = `BLOCKED — ${domain} is blocked under "${data.category}".`;
      result.className = "test-result blocked";
    } else {
      result.textContent = `ALLOWED — ${domain} is not blocked for this profile.`;
      result.className = "test-result allowed";
    }
  } catch (e) {
    result.textContent = "Could not reach the API. Check the URL and try again.";
    result.className = "test-result blocked";
  }
});
