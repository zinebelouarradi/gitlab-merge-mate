function init() {
  chrome.storage.local
    .get(["token"])
    .then(async function (results) {
      const { token } = results;
      if (token) {
        document.getElementById("sign-out").style = "display: block";
        document.getElementById("log-in-hint").style = "display: none";
      }
    });
}

function signOut() {
  chrome.storage.local.clear().then(() => {
    document.getElementById("sign-out").style = "display: none";
    window.close()
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const signOutButton = document.getElementById("sign-out");
  const addProjectButton = document.getElementById("project-id-input");
  if (signOutButton) {
    signOutButton.addEventListener("click", signOut);
  }
  init()
});
