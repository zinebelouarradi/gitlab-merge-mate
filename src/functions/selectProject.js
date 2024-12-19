import {fetchMergeRequests} from "./fetchMergeRequests.js"
function selectProject(projectId) {
  const allButtons = document.querySelectorAll(".selected-project-button");

  allButtons.forEach((button) => {
    button.style.borderColor = "transparent";
  });

  if(projectId){
    const parentButton = document.getElementById(`pinned-${projectId}`);

    if (parentButton) {
      parentButton.style.borderColor = "#428fdc";
      console.log("should be scrolling");
    }

    const projectID = projectId === "owned-mrs" ? undefined : projectId;

    fetchMergeRequests(projectID).then((res) => {
      console.log(projectID, "clicked");
    });
  }
}


export default selectProject;
