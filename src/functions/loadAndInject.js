async function loadAndInjectFragment(url, targetId) {
  try {
    const response = await fetch(url);
    const fragment = await response.text();
    document.getElementById(targetId).innerHTML = fragment;
  } catch (error) {
    console.error(`Error loading fragment from ${url}: ${error.message}`);
  }
}

loadAndInjectFragment('loader.html', 'loader');
loadAndInjectFragment('token-input.html', 'token-input');
loadAndInjectFragment('search-input.html', 'search-input');
loadAndInjectFragment('project-table.html', 'project-table');
loadAndInjectFragment('merge-table.html', 'merge-table');
