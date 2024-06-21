const token = localStorage.getItem("token");
let groupId;

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
