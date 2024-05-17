async function getFormValue(e) {
  e.preventDefault();
  let name = e.target.name.value;
  let email = e.target.email.value;
  let phone = e.target.phone.value;
  let password = e.target.password.value;
  let myObj = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    password: password,
  };
  try {
    const add = await axios.post("/sign-up", myObj);
    // alert("Signup Successful");
    clear();
    // console.log(add, "post");
    window.location.href = "/login";
  } catch (err) {
    console.log(err);
    alert("Email already exists, please Login");
    document.body.innerHTML += `<div style="color:red;">${err} <div>`;
  }
}

function clear() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("password").value = "";
}

const loginBtn = document.getElementById("loginbtn");

loginBtn.addEventListener("click", () => {
  window.location.href = "/login";
});
