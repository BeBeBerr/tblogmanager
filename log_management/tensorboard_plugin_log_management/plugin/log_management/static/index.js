// Copyright 2019 The TensorFlow Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =============================================================================

import * as Model from './model.js';
import * as Views from './views.js';

/**
 * The main entry point of any TensorBoard iframe plugin.
 * It builds UI in this form:
 *   <link rel="stylesheet" href="./static/style.css" />
 *
 *   <h1>Example plugin - Select a run</h1>
 *   <select class="run-selector"></select>
 *   <div>${previewElements}</div>
 */
export async function render() {

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './static/style.css';
  document.body.appendChild(stylesheet);

  var headerContainer = document.createElement('div');
  headerContainer.className = 'header';
  var header = document.createElement('h2');
  header.innerText = 'Log Management';
  var refresher = document.createElement('button');
  refresher.className = 'refresher';
  refresher.innerText = 'Refresh';
  refresher.onclick = () => {
    location.reload();
  };
  headerContainer.appendChild(header);
  headerContainer.appendChild(refresher);
  document.body.appendChild(headerContainer);

  var rootDiv = document.createElement('div');
  rootDiv.id = 'rootDiv';
  document.body.appendChild(rootDiv);


  // fetch('static/index.html')
  //   .then(response => response.text())
  //   .then(text => document.getElementById('rootDiv').innerHTML = text);

  const folders = await Model.getFolders();
  console.log(folders)

  rootDiv.appendChild(build_table(folders));
}


function build_table(folders) {
  var table = document.createElement("table");
  table.innerHTML = `
  <tr>
  <th>Log Directory</th>
  <th>Rename</th> 
  <th>Delete</th>
  </tr>`;

  for (var i in folders) {
    table.appendChild(build_row(folders[i]));
  }
  return table;
}

function build_row(folder) {
  var row = document.createElement("tr");
  var name = document.createElement("td");
  name.innerText = folder;

  var rename = document.createElement("td");
  var input = document.createElement("input");
  input.type = "text";
  input.size = "40";
  input.id = "input-" + folder;
  var button = document.createElement("button");
  button.type = "button";
  button.innerText = "Confirm";
  button.onclick = () => {
    onRename(folder);
  };
  rename.appendChild(input);
  rename.appendChild(button);


  var delete_elm = document.createElement("td");
  delete_elm.className = "delete";
  var delete_btn = document.createElement("button");
  delete_btn.innerText = "Delete";
  delete_btn.type = "button";
  delete_btn.onclick = () => {
    onDelete(folder, delete_btn);
  };
  delete_elm.appendChild(delete_btn);

  row.appendChild(name);
  row.appendChild(rename);
  row.appendChild(delete_elm);
  return row;
}

async function onRename(folder) {
  var inputValue = document.getElementById("input-" + folder).value;
  if (inputValue.length == 0) {
    alert("New name is too short!");
    return;
  }
  console.log(inputValue);
  var response = await Model.renameRequest(folder, inputValue);
  if (response == null) {
    alert("Invalid new name!");
    return;
  }
  location.reload();
}

async function onDelete(folder, btn) {
  console.log(folder);
  if (btn.innerText == "Delete") {
    btn.innerText = "Are you sure?"
  } else {
    var response = await Model.deleteRequest(folder);
    if (response == null) {
      alert("Failed to delete.");
      return;
    }
    location.reload();
  }
  
}