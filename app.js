const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const port = process.env.PORT || 3000;

const sequelize = require("./util/database");
const User = require("./models/user");
const userHistory = require("./models/chatHistory");
const errorRoutes = require("./routes/404");
const userRoutes = require("./routes/userRoutes");
const mainRoutes = require("./routes/mainRoutes");

const app = express();

app.use(cors({ origin: "*", method: ["GET", "POST"] }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("views"));

app.use("/", userRoutes);
app.use("/", mainRoutes);
app.use(errorRoutes);

User.hasMany(userHistory);
userHistory.belongsTo(User, { constraints: true });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log("app is listening to port ", port);
    });
  })
  .catch((err) => {
    console.log(err);
  });
