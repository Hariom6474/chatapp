const path = require("path");

exports.user = async (req, res, next) => {
  await res.sendFile(path.join(__dirname, "../views", "home.html"), (err) => {
    if (err) {
      console.error("Error sending home.html file:", err);
      res.status(500).send("Error occurred");
    } else {
      // console.log("login.html file sent successfully");
    }
  });
};
