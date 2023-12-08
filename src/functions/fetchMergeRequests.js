import { gitlabApiURL } from "../variables.js";

function getUrl(projectId) {
  if (projectId && typeof projectId === "string") {
    return `${gitlabApiURL}projects/${projectId}/merge_requests?state=opened`;
  } else {
    return `${gitlabApiURL}merge_requests?state=opened`;
  }
}

export async function fetchMergeRequests(projectId) {
  try {
    let gitlabToken = "";
    let { token } = await chrome.storage.local.get(["token"]);

    if (!token) {
      gitlabToken = document.getElementById("gitlab-token").value;
    } else {
      gitlabToken = token;
    }

    const res = await fetch(getUrl(projectId), {
      headers: {
        Authorization: `Bearer ${gitlabToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    } else {
      document.getElementById("merge-table").style = "display: block";
      document.getElementById("token-input").style = "display: none";
      document.getElementById("project-search-input").style = "display: flex";
      document.getElementById("pinned-projects-section").style =
        "display: flex";

      if (!token) {
        chrome.storage.local.set({ token: gitlabToken }).then(() => {
          console.log("Value is set", gitlabToken);
        });
      }
    }

    const requests = await res.json();
    document.getElementById("loader").style = "display: none";
    const tableBody = document.getElementById("merge-table-body");

    if (tableBody) {
      tableBody.innerHTML = "";

      if (requests.length > 0) {
        tableBody.addEventListener("click", handleCopyClick);

        requests.forEach((request) => {
          const row = tableBody.insertRow();
          row.insertCell(0).innerHTML =
            `<a href="${request.web_url}" target="_blank" style="color: blue; text-decoration: underline;" title="open in new tab">${request.title}</a>`;
          const cell1 = row.insertCell(1);
          cell1.innerHTML = ` ${request.source_branch}<button id="${request.source_branch}" value=${request.source_branch} class="copy-button">
                                <img class="copy-img" src="../icons/copy.svg" title="copy"/>                                 </button>`;
          cell1.className = "branch-cell";
          row.insertCell(2).textContent = request.author.name;
          row.insertCell(3).innerHTML = request.detailed_merge_status;
          row.insertCell(4).innerHTML = request.blocking_discussions_resolved;
          row.insertCell(5).textContent = request.has_conflicts;
        });
      } else {
        const emptyRow = tableBody.insertRow();
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;"><img class="empty-img" src="../icons/empty.svg"/><br>No open merge requests</td>`;
      }
      document
        .getElementById("merge-table")
        .scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

function handleCopyClick(event) {
  const button = event.target.closest("button");
  if (button) {
    const project = button.value;
    navigator.clipboard.writeText(project);

    const spanElement = document.createElement("span");
    spanElement.innerText = "Copied";
    spanElement.className = "copy-branch-name"
    button.appendChild(spanElement);

    setTimeout(function () {
      button.removeChild(spanElement)
    }, 500);
  }
}
