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
  } catch (err) {
    console.log(err);
  }
}

function createListItem({ message }) {
  //   const token = localStorage.getItem("token");
  const chatMessages = document.getElementById("chatMessages");
  const userMessage = document.createElement("div");
  userMessage.className = "message";
  //   userMessage.innerText = `${token.userId}: ${message}`;
  userMessage.innerText = message;
  chatMessages.appendChild(userMessage);
  clearFormInput();
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/home/get-message", {
      headers: { Authorization: token },
    });
    if (res) {
      res.data.forEach((item) => {
        createListItem(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
});

function clearFormInput() {
  document.getElementById("inputMessage").value = "";
}
