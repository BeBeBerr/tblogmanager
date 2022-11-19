
export async function getFolders() {
  var info = (await fetchJSON('./folders')) || {};
  return info.folders;
}

export async function renameRequest(folder, new_name) {
  const response = await fetch('./rename?' + new URLSearchParams({
    folder: folder,
    new_name: new_name,
  }));
  if (!response.ok) {
    return null;
  }
  return response;
}

export async function deleteRequest(folder) {
  const response = await fetch('./delete?' + new URLSearchParams({
    folder: folder,
  }));
  if (!response.ok) {
    return null;
  }
  return response;
}


async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}
