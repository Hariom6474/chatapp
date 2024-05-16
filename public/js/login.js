const signUpBtn = document.getElementById("signUpBtn");

signUpBtn.addEventListener("click", () => {
  window.location.href = "/signUp";
});

const forgot = document.getElementById("forgotPassword");

forgot.addEventListener("click", () => {
  window.location.href = "/password/forgotPassword";
});
