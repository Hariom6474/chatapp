const path = require("path");

exports.getLoginpage = async (req, res, next) => {
  await res.sendFile(path.join(__dirname, "../views", "login.html"), (err) => {
    if (err) {
      console.error("Error sending login.html file:", err);
      res.status(402).send("Error occurred");
    } else {
      // console.log("login.html file sent successfully");
    }
  });
};
