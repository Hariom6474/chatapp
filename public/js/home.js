async function addMessage(e) {
  e.preventDefault();
  let message = document.getElementById("inputMessage").value;
  let myObj = {
    message: message,
  };
  try {
    const token = localStorage.getItem("token");
    const add = await axios.post("/home", myObj, {
      headers: { Authorization: token },
    });
    myObj = add.data;
    createListItem(myObj);
    updateLocalStorage(myObj);
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
}

function createListItem(myObj) {
  const currentUserId = localStorage.getItem("userId");
  const messages = JSON.parse(localStorage.getItem("messages"));
  const user = messages.find((message) => message.userId === myObj.userId);
  const userName = user ? user.user.name : "Unknown";
  const chatMessages = document.getElementById("chatMessages");
  const userMessage = document.createElement("div");
  userMessage.className = "message";
  userMessage.innerText = `${
    myObj.userId === currentUserId ? "You" : userName
  }: ${myObj.message}`;
  chatMessages.appendChild(userMessage);
}

function removeListItem() {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = "";
}

let intervalId;

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await refreshMessages();
    intervalId = setInterval(refreshMessages, 6000);
  } catch (err) {
    console.error(err);
  }
});

async function refreshMessages() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/home/get-message", {
      headers: {
        Authorization: token,
      },
    });
    if (res) {
      removeListItem();
      const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
      storedMessages.forEach((item) => {
        createListItem(item);
      });
      localStorage.setItem("messages", JSON.stringify(res.data.slice(-10)));
    }
  } catch (err) {
    console.error(err);
  }
}

function clearFormInput() {
  document.getElementById("inputMessage").value = "";
}
