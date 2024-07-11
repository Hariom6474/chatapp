const token = localStorage.getItem("token");
let groupId;

//for adding admin
const addAdminForm = document.getElementById("addAdminForm");
addAdminForm.addEventListener("submit", addAdmin);

//for adding users to an existing group
const addUserForm = document.getElementById("addUserForm");
addUserForm.addEventListener("submit", addUsers);

//for removing users from group;
const removeUserForm = document.getElementById("removeUserForm");
removeUserForm.addEventListener("submit", removeUser);

async function addMessage(e) {
  e.preventDefault();
  let message = document.getElementById("inputMessage").value;
  // console.log(groupId);
  let myObj = {
    message: message,
    groupId: groupId,
  };
  try {
    const add = await axios.post("/home", myObj, {
      headers: { Authorization: token },
    });
    myObj = add.data;
    createListItem(myObj);
    // updateLocalStorage(myObj);
    clearFormInput();
  } catch (err) {
    console.log(err);
  }
}

function updateLocalStorage(messageObj) {
  const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  storedMessages.push(messageObj);
  if (storedMessages.length > 10) {
    storedMessages.shift();
  }
  localStorage.setItem("messages", JSON.stringify(storedMessages));
  // localStorage.setItem("messages", JSON.stringify(storedMessages.slice(-10)));
}

// add messages in the div
function createListItem(myObj) {
  const currentUserId = parseJwt(token).userId;
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  const user = messages.find((message) => message.userId === myObj.userId);
  const userName = user && user.user ? user.user.name : "Unknown";
  const chatMessages = document.getElementById("chatMessages");
  const userMessage = document.createElement("div");
  userMessage.className = "message";
  userMessage.innerText = `${
    myObj.userId === currentUserId ? "You" : userName
  }: ${myObj.message}`;
  chatMessages.appendChild(userMessage);
}

// remove chat messages
function removeListItem() {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = "";
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

let intervalId;

window.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    window.location.href = "/login";
  }
  try {
    // await refreshMessages();
    await displayAllUsers();
    await getGroupsOnReload();
    // intervalId = setInterval(refreshMessages, 6000);
  } catch (err) {
    console.error(err);
  }
});

//getting users for adding in a group;
async function displayAllUsers() {
  try {
    const {
      data: { User },
    } = await axios.get("/home/get-users", {
      headers: { Authorization: token },
    });
    const userList = document.getElementById("membersList");
    const fragment = document.createDocumentFragment(); // it lets us insert data in one fragment
    User.forEach(({ id, Name }) => {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "users";
      input.value = id;
      const p = document.createElement("p");
      p.appendChild(input);
      p.appendChild(document.createTextNode(Name));
      fragment.appendChild(p); // maintains structure
    });
    userList.appendChild(fragment);
  } catch (err) {
    document.body.innerHTML =
      document.body.innerHTML +
      '<h4 style="color: red;">Could not show Details</h4>';
    console.log(err);
  }
}

// async function refreshMessages() {
//   try {
//     const res = await axios.get("/home/get-message", {
//       headers: {
//         Authorization: token,
//       },
//     });
//     if (res) {
//       removeListItem();
//       const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
//       storedMessages.forEach((item) => {
//         createListItem(item);
//       });
//       localStorage.setItem("messages", JSON.stringify(res.data.slice(-10)));
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

function clearFormInput() {
  document.getElementById("inputMessage").value = "";
}

async function createGroup(e) {
  e.preventDefault();
  document.getElementById("error-message").innerText = "";
  const groupName = document.getElementById("group-name").value;
  const checkboxes = document.getElementsByName("users");
  const users = [];
  const userId = parseJwt(token).userId;
  if (groupName.trim() === "") {
    document.getElementById("error-message").innerText =
      "Please enter a group name";
    return;
  }
  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      users.push(checkboxes[i].value);
    }
  }
  if (users.length === 0) {
    document.getElementById("error-message").innerText =
      "Please select at least one checkbox.";
  } else {
    const details = {
      name: groupName,
      users: users,
    };
    try {
      const res = await axios.post(`/group/createGroup`, details, {
        headers: { Authorization: token },
      });
      document.getElementById("groupModalClose").click();
      showGroups(res.data.details);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }
}

function showGroups(obj) {
  const groupList = document.getElementById("groupList");
  const button = document.createElement("button");
  button.className = "list-group-item list-group-item-action";
  button.setAttribute("data-bs-toggle", "list");
  button.addEventListener("click", showAllChats);
  button.innerHTML = obj.groupName;
  button.value = obj.id;
  groupList.appendChild(button);
  localStorage.setItem("groupId", obj.id);
}

// grtting chats on click of group button
async function showAllChats(e) {
  try {
    removeListItem();
    // console.log(e.target.value);
    groupId = e.target.value;
    localStorage.setItem("groupId", groupId);
    // console.log(groupId);
    document.getElementById("mainChatBox").style.visibility = "visible";
    const userId = parseJwt(token).userId;
    const res = await axios.get(
      `/group/getGroupChat?groupId=${groupId}&userId=${userId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    if (res) {
      const messages = res.data.chats || [];
      localStorage.setItem("messages", JSON.stringify(messages.slice(-10)));
      messages.slice(-10).forEach((item) => {
        createListItem(item);
      });
    }
    creatingDropdownButton();
    showGroupInfo();
    permission();
  } catch (err) {
    console.error(err);
  }
}

//getting user's group from backend
async function getGroupsOnReload() {
  try {
    const res = await axios.get(`/group/getGroups`, {
      headers: { Authorization: token },
    });
    //console.log(res.data[0].groups.length);
    for (let i = 0; i < res.data[0].groups.length; i++) {
      showGroups(res.data[0].groups[i]);
    }
  } catch (err) {
    console.log(err);
  }
}

function creatingDropdownButton() {
  const list = document.getElementById("dropdownMenu");
  list.innerHTML = "";

  //show group info who is admin and user
  const li0 = document.createElement("li");
  const btn0 = document.createElement("button");
  btn0.className = "dropdown-item";
  btn0.setAttribute("data-bs-toggle", "modal");
  btn0.setAttribute("data-bs-target", "#groupInfoModal");
  btn0.id = "groupInfo";
  btn0.innerHTML = "Group Info";
  li0.appendChild(btn0);
  list.appendChild(li0);

  //Add admin button
  const li1 = document.createElement("li");
  const btn1 = document.createElement("button");
  btn1.className = "dropdown-item";
  btn1.setAttribute("data-bs-toggle", "modal");
  btn1.setAttribute("data-bs-target", "#addAdminModal");
  btn1.id = "addAdmin";
  btn1.innerHTML = "Add new admin";
  li1.appendChild(btn1);
  list.appendChild(li1);

  //adding users to an existing group
  const li2 = document.createElement("li");
  const btn2 = document.createElement("button");
  btn2.className = "dropdown-item";
  btn2.setAttribute("data-bs-toggle", "modal");
  btn2.setAttribute("data-bs-target", "#addUserModal");
  btn2.id = "addMembers";
  btn2.innerHTML = "Add members";
  li2.appendChild(btn2);
  list.appendChild(li2);

  //removing users from an existing group
  const li3 = document.createElement("li");
  const btn3 = document.createElement("button");
  btn3.className = "dropdown-item";
  btn3.setAttribute("data-bs-toggle", "modal");
  btn3.setAttribute("data-bs-target", "#removeUserModal");
  btn3.id = "removeMembers";
  btn3.innerHTML = "Remove members";
  li3.appendChild(btn3);
  list.appendChild(li3);
}

async function showGroupInfo() {
  groupId = localStorage.getItem("groupId");
  const res1 = await axios.get(`group/showUsersOfGroup?groupId=${groupId}`, {
    headers: { Authorization: token },
  });
  // console.log(res1.data.users[0].users[0].name);
  //Displaying group Name
  document.getElementById(
    "groupInfoGroupName"
  ).innerHTML = `${res1.data.users[0].groupName}`;
  //displaying Number of Members in the group
  document.getElementById(
    "groupInfoMemberCount"
  ).innerHTML = `Group :${res1.data.users[0].users.length} members`;
  //for displaying members of group
  const memberList = document.getElementById("groupInfoMemberList");
  memberList.innerHTML = "";
  const a = document.createElement("h4");
  a.innerHTML = "Group Members";
  memberList.append(a);
  for (let i = 0; i < res1.data.users[0].users.length; i++) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.appendChild(
      document.createTextNode(`${res1.data.users[0].users[i].name}`)
    );
    memberList.append(li);
  }
  //displaying Admins of group
  const adminList = document.getElementById("groupInfoadminList");
  adminList.innerHTML = "";
  const h4 = document.createElement("h4");
  h4.innerHTML = "Group Admins";
  adminList.append(h4);
  const res2 = await axios.get(`/group/getGroupAdmins?groupId=${groupId}`, {
    headers: { Authorization: token },
  });
  // console.log(res2.data.admins);
  for (let i = 0; i < res2.data.admins.length; i++) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.appendChild(document.createTextNode(`${res2.data.admins[i]}`));
    adminList.append(li);
  }
}

async function permission() {
  creatingDropdownButton();
  const groupid = localStorage.getItem("groupId");
  try {
    if (groupId) {
      const res1 = await axios.get(`/group/checkAdmin?groupId=${groupid}`, {
        headers: { Authorization: token },
      });
      if (res1.data.success === false) {
        document.getElementById("addAdmin").remove();
        document.getElementById("addMembers").remove();
        document.getElementById("removeMembers").remove();
      } else {
        showUsersForAddingAdmin();
        showUsersForAddingMembers();
        showUsersForRemovingMembers();
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function showUsersForAddingAdmin() {
  const button = document.getElementById("addAdminButton");
  const userList = document.getElementById("addAdminList");
  try {
    button.style.visibility = "visible";
    let groupId = localStorage.getItem("groupId") || 0;
    const res = await axios.get(`/admin/getUsers?groupId=${groupId}`, {
      headers: { Authorization: token },
    });
    // console.log(res.data[0].name);
    userList.innerHTML = "";
    if (res.data.length > 0) {
      res.data.forEach((user) => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "adminUsers";
        input.value = user.id;
        const p = document.createElement("p");
        p.appendChild(input);
        p.appendChild(document.createTextNode(user.name));
        userList.appendChild(p);
      });
    } else {
      userList.innerHTML = userList.innerHTML + "<h4>No Users Found!</h4>";
      button.style.visibility = "hidden";
    }
  } catch (err) {
    console.log(err);
  }
}

async function addAdmin(e) {
  e.preventDefault();
  const checkboxes = document.getElementsByName("adminUsers");
  const users = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  if (users.length === 0) {
    document.getElementById("error-message1").innerText =
      "Please select at least one checkbox.";
    return;
  }
  const details = { users };
  const groupId = localStorage.getItem("groupId");
  if (groupId) {
    try {
      const res = await axios.post(
        `/admin/addAdmin?groupId=${groupId}`,
        details,
        { headers: { Authorization: token } }
      );
      document.getElementById("addAdminModalClose").click();
      document.getElementById("addAdminForm").reset();
      document.getElementById("error-message1").innerText = "";
      window.location.reload();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }
}

//for adding users to an existing group
async function showUsersForAddingMembers() {
  const button = document.getElementById("addUserButton");
  const userList = document.getElementById("addUserList");
  try {
    button.style.visibility = "visible";
    const groupId = localStorage.getItem("groupId") || 0;
    const res = await axios.get(
      `/group/showUsersForAdding?groupId=${groupId}`,
      { headers: { Authorization: token } }
    );
    userList.innerHTML = "";
    if (res.data.length > 0) {
      res.data.forEach((user) => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "addUsers";
        input.value = user.id;
        const p = document.createElement("p");
        p.appendChild(input);
        p.appendChild(document.createTextNode(user.name));
        userList.appendChild(p);
      });
    } else {
      userList.innerHTML = userList.innerHTML + "<h4>No Users Found!</h4>";
      button.style.visibility = "hidden";
    }
  } catch (err) {
    console.log(err);
  }
}

async function addUsers(e) {
  e.preventDefault();
  const checkboxes = document.getElementsByName("addUsers");
  const users = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  if (users.length === 0) {
    document.getElementById("error-message1").innerText =
      "Please select at least one checkbox.";
    return;
  }
  const details = { users };
  const groupId = localStorage.getItem("groupId");
  if (groupId) {
    try {
      const res = await axios.post(
        `/group/addUsers?groupId=${groupId}`,
        details,
        { headers: { Authorization: token } }
      );
      document.getElementById("addUserModalClose").click();
      addUserForm.reset();
      window.location.reload();
      document.getElementById("error-message3").innerText = "";
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }
}

async function showUsersForRemovingMembers() {
  const button = document.getElementById("removeUserButton");
  const userList = document.getElementById("removeUserList");
  try {
    button.style.visibility = "visible";
    const groupId = localStorage.getItem("groupId") || 0;
    const res = await axios.get(
      `/group/showUsersForRemoving?groupId=${groupId}`,
      { headers: { Authorization: token } }
    );
    userList.innerHTML = "";
    if (res.data.length > 0) {
      res.data.forEach((user) => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "rUsers";
        input.value = user.id;
        const p = document.createElement("p");
        p.appendChild(input);
        p.appendChild(document.createTextNode(user.name));
        userList.appendChild(p);
      });
    } else {
      userList.innerHTML = userList.innerHTML + "<h4>No Users Found!</h4>";
      button.style.visibility = "hidden";
    }
  } catch (err) {
    console.log(err);
  }
}

async function removeUser(e) {
  e.preventDefault();
  const checkboxes = document.getElementsByName("rUsers");
  const users = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  if (users.length === 0) {
    document.getElementById("error-message1").innerText =
      "Please select at least one checkbox.";
    return;
  }
  const details = { users };
  const groupId = localStorage.getItem("groupId") || 0;
  if (groupId) {
    try {
      const res = await axios.post(
        `/group/removeUsers?groupId=${groupId}`,
        details,
        { headers: { Authorization: token } }
      );
      document.getElementById("removeUserModalClose").click();
      removeUserForm.reset();
      window.location.reload();
      document.getElementById("error-message2").innerText = "";
    } catch (error) {
      console.error("Error creating group:", error);
    }
  }
}
