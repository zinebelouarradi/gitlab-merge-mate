import { gitlabApiURL } from "../variables.js";

function getMergeRequestUrl() {
  return `${gitlabApiURL}merge_requests?state=opened`;
}

function getProjectMergeRequestUrl(projectId) {
  return `${gitlabApiURL}projects/${projectId}/merge_requests?state=opened`;
}

async function fetchGitlabToken() {
  const errorArea = document.getElementById("error-box");
  errorArea.style.display = "none";
  const { token } = await chrome.storage.local.get(["token"]);
  return token || document.getElementById("gitlab-token").value;
}

export async function fetchMergeRequests(projectId) {
  try {
    const gitlabToken = await fetchGitlabToken();
    let response;

    const url = typeof projectId === "string"
      ? getProjectMergeRequestUrl(projectId)
      : getMergeRequestUrl();

    response = await fetch(url, {
      headers: { Authorization: `Bearer ${gitlabToken}` },
    });

    if (!response.ok) {
      const errorArea = document.getElementById("error-box");
      errorArea.innerText = "Invalid Token"
      errorArea.style.display = "block";
      return
    }

    const data = await response.json();
    await populateMergeRequestsTable(data);

    updateUIComponents(gitlabToken);
  } catch (error) {
    console.error("Error fetching merge requests:", error.message);
  }
}


function updateUIComponents(gitlabToken) {
  document.getElementById("merge-table").style.display = "block";
  document.getElementById("login-elements").style.display = "none";
  document.getElementById("project-search-input").style.display = "flex";
  document.getElementById("pinned-projects-section").style.display = "flex";
  document.getElementById("loader").style = "display: none";

  if (gitlabToken) {
    chrome.storage.local.set({ token: gitlabToken });
  }
}

async function populateMergeRequestsTable(requests) {
  const tableBody = document.getElementById("merge-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  if (requests.length > 0) {
    requests.forEach((request) => appendMergeRequestRow(tableBody, request));
  } else {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">
      <img class="empty-img" src="../icons/empty.svg"/><br>No open merge requests</td></tr>`;
  }

  document.getElementById("merge-table").scrollIntoView({ behavior: "smooth" });
}

function appendMergeRequestRow(tableBody, request) {
  const isMergeable = request.detailed_merge_status === "mergeable";
  const statusIcon = isMergeable ? "../icons/check.svg" : "../icons/uncheck.svg";

  const row = tableBody.insertRow();
  row.innerHTML = `
    <td><a href="${request.web_url}" target="_blank" class="request-link">${request.title}</a></td>
    <td class="branch-cell">
    <span>${request.source_branch}</span>
      <button id="${request.source_branch}" value="${request.source_branch}" class="copy-button">
        <img class="copy-img" src="../../icons/copy.svg" title="copy"/>
      </button>
    </td>
    <td><a href="${request.author.web_url}" target="_blank"><img class="author-avatar" src="${request.author.avatar_url}" title="${request.author.name}"/></a></td>
    <td>${!request.blocking_discussions_resolved}</td>
    <td>${request.has_conflicts}</td>
    <td><img class="approved-img" src="${statusIcon}"/></td>
  `;

  if(row.innerHTML){
    document.getElementById(request.source_branch).addEventListener('click', handleCopyClick);
  }
}


function handleCopyClick(event) {
  const button = event.target.closest("button");
  if (button) {
    navigator.clipboard.writeText(button.value);
    showCopyConfirmation(button);
  }
}

function showCopyConfirmation(button) {
  const spanElement = document.createElement("span");
  spanElement.innerText = "copied";
  spanElement.className = "copy-branch-name";
  button.appendChild(spanElement);

  setTimeout(() => button.removeChild(spanElement), 500);
}
