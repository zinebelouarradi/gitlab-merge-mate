import {gitlabApiURL} from "../variables.js";
import {handlePinnedProjects} from "./pinnedProjects.js";
import selectProject from "./selectProject.js"
import {fetchMergeRequests} from "./fetchMergeRequests.js";

export async function fetchProjects() {
  const {token} = await chrome.storage.local.get(["token"]);
  const query = document.getElementById("search-input").value;
  try {
    const res = await fetch(
      `${gitlabApiURL}projects?membership=true&search=${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    } else {
      document.getElementById("project-table").style.display = "block";
    }

    const projects = await res.json();
    const projectsDiv = document.getElementById("project-table");

    if (projectsDiv) {
      if (projects.length > 0) {
        projectsDiv.innerHTML = "";
        projectsDiv.addEventListener("click", handleContainerClick);

        projects.forEach((project) => {
          const divElement = document.createElement("div")
          divElement.className = "project-element"

          divElement.innerHTML = `
            <div class="fetch-project-button" id=${project.id}>${project.name_with_namespace}        
             <a id="link-${project.id}" href="${project.web_url}" target="_blank"> 
              <img class="pin-image" src="../icons/external-link.svg" alt="pin"/>
              </a>
             </div>
            <button id="button-${project.id}" value=${project.id} class="pin-button" title="Pin project">
              <img class="external-link-image" src="../icons/pin.svg" alt="pin"/>
            </button>`;
          projectsDiv.appendChild(divElement);
        });

      } else {
        projectsDiv.innerHTML = "<span>There are no projects available to be displayed here.</span>"
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function handleContainerClick(event) {
  const div = event.target.closest(".fetch-project-button");
  const button = event.target.closest("button");

  if (div) {
    const divElement = event.target.closest(".project-element");

    const allDivsWithClass = document.querySelectorAll(".outlined-selected-project");
    allDivsWithClass.forEach(div => {
      if (div !== divElement) {
        div.classList.remove("outlined-selected-project");
        div.classList.add("outlined-unselected-project");
      }
    });

    divElement.classList.remove("outlined-unselected-project");
    divElement.classList.add("outlined-selected-project");

    handleCheckboxClick(div);
    selectProject();
  } else if (button) {
    const projectId = button.value;
    handleButtonClick(projectId);
  }
}

function handleCheckboxClick(div) {
  fetchMergeRequests(div.id).then((res) =>
    console.log("fetching requests for project", div.id),
  );
}

function handleButtonClick(projectId) {
  chrome.storage.local.get(["projects"]).then(async function (result) {
    const {projects} = result;
    if (projects) {
      if (!Object.keys(projects).includes(projectId)) {
        const projectName = prompt("Enter a display name for the project:");
        if (!projectName) {
          return;
        }
        const storeProjects = {...projects, [projectId]: projectName};
        chrome.storage.local.set({projects: storeProjects});
        handlePinnedProjects({[projectId]: projectName});
      } else {
        selectProject(projectId);
      }
    } else {
      const projectName = prompt("Enter a name for the project:");
      if (!projectName) {
        return;
      }
      chrome.storage.local
        .set({projects: {[projectId]: projectName}})
        .then(() => {
          chrome.storage.local
            .get(["projects"])
            .then((results) => handlePinnedProjects(results.projects));
        });
    }
  });
}
