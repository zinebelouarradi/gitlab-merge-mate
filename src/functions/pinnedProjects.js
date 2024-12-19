import selectProject from "./selectProject.js"

export function handlePinnedProjects(projects) {
  let divElement = document.getElementById("selected-projects");

  if (!projects) {
    divElement.innerHTML = `<div class="selected-project-button" id="pinned-owned-mrs" style="border-color: #428fdc">
            <label for="owned-mrs">Owned</label>
            <input type="radio" id="owned-mrs" name="radio"  />
          </div>`;
    return;
  }

  Object.keys(projects).forEach((project) => {
    const buttonElement = document.createElement("div");
    buttonElement.className = "selected-project-button";
    buttonElement.id = `pinned-${project}`;
    buttonElement.innerHTML = `<label for=${project}>${projects[project]}</label><input type="radio" name="radio" id=${project}>`;
    const radioElement = buttonElement.querySelector(`input[type="radio"]`);
    radioElement.addEventListener("click", handlePinContainerClick);
    divElement.appendChild(buttonElement);
  });
}

export function handlePinContainerClick(event) {
  const clickedRadioId = event.target.id;
  selectProject(clickedRadioId);
}


