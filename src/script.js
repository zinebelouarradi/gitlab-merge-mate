import { fetchProjects } from "./functions/fetchProjects.js";
import { handlePinnedProjects, handlePinContainerClick } from "./functions/pinnedProjects.js";
import { fetchMergeRequests } from "./functions/fetchMergeRequests.js";

// Initializes the app by checking token and setting up projects or showing token input
async function initializeApp() {
  try {
    const { token, projects } = await chrome.storage.local.get(["token", "projects"]);

    if (token) {
      await fetchMergeRequests();

      if (projects) {
        handlePinnedProjects(projects);
      }
    } else {
      displayTokenInput();
    }
  } catch (error) {
    console.error("Error initializing the app:", error);
  }
}

// Displays the token input UI
function displayTokenInput() {
  const loginElemets = document.getElementById("login-elements");
  if (loginElemets) {
    loginElemets.style.display = 'flex';
  }
}

// Clears the projects section UI and resets the search input
function clearProjectsUI() {
  const projectsDiv = document.getElementById("project-table");
  const searchInput = document.getElementById("search-input");

  if (projectsDiv) {
    projectsDiv.innerHTML = "";
  }

  if (searchInput) {
    searchInput.value = "";
  }
}

// Clears pinned projects from storage and refreshes the UI
async function clearPinnedProjects() {
  try {
    await chrome.storage.local.remove(["projects"]);
    handlePinnedProjects();
    await fetchMergeRequests();
  } catch (error) {
    console.error("Error clearing pinned projects:", error);
  }
}

// Handles the Enter key event for fetching projects
function handleSearchInputKeyDown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    fetchProjects();
  }
}

// Sets up event listeners for various UI elements
function setupEventListeners() {
  document.getElementById("fetch-data-button")?.addEventListener("click", fetchMergeRequests);
  document.getElementById("search-input")?.addEventListener("keydown", handleSearchInputKeyDown);
  document.getElementById("owned-mrs")?.addEventListener("click", handlePinContainerClick);
  document.getElementById("selected-projects")?.addEventListener("click", clearProjectsUI);
  document.getElementById("clear-pinned-projects")?.addEventListener("click", clearPinnedProjects);
}

// Entry point: Sets up event listeners and initializes the app
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  initializeApp();
});
