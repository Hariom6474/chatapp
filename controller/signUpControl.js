exports.getSignUppage = async (req, res, next) => {
  await res.sendFile("signUp.html", { root: "views" });
};
