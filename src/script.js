import { fetchProjects } from "./functions/fetchProjects.js";
import {
  handlePinnedProjects,
  handlePinContainerClick,
} from "./functions/pinnedProjects.js";
import { fetchMergeRequests } from "./functions/fetchMergeRequests.js";
import { gitlabApiURL } from "./variables.js";

async function init() {
  chrome.storage.local
    .get(["token", "projects"])
    .then(async function (results) {
      const { token, projects } = results;
      if (!!token) {
        await fetchMergeRequests();
        if (projects) {
          handlePinnedProjects(projects);
        }
      } else {
        document.getElementById("token-input").style = "display: flex";
      }
    });
}

function clearProjectsSection() {
  const projectsDiv = document.getElementById("project-table");
  document.getElementById("search-input").value = "";
  if (projectsDiv) {
    projectsDiv.innerHTML = "";
  }
}

function clearPinnedProjectsFun(){
  chrome.storage.local.remove(["projects"]).then(async (res) => {
      handlePinnedProjects()
      await fetchMergeRequests()
  })
}

function handleKeyDown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    fetchProjects();
  }
}

window.addEventListener('click', function(e){
  if (!document.getElementById('projects-section').contains(e.target)){
    clearProjectsSection()
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const fetchDataButton = document.getElementById("fetch-data-button");
  const searchProjectButton = document.getElementById("search-input");
  const ownedMergeRequests = document.getElementById("owned-mrs");
  const selectedProjects = document.getElementById("selected-projects");
  const clearPinnedProjects = document.getElementById("clear-pinned-projects")
  const copyButton = document.getElementById("copy-button")
  if (searchProjectButton) {
    searchProjectButton.addEventListener("keydown", handleKeyDown);
  }
  if (fetchDataButton) {
    fetchDataButton.addEventListener("click", fetchMergeRequests);
  }
  if (ownedMergeRequests) {
    ownedMergeRequests.addEventListener("click", handlePinContainerClick);
  }
  if (selectedProjects) {
    selectedProjects.addEventListener("click", clearProjectsSection);
  }
  if(clearPinnedProjects){
    clearPinnedProjects.addEventListener("click", clearPinnedProjectsFun)
  }
  init();
});

