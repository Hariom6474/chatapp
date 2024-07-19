const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const socketIo = require("socket.io");
const http = require("http");
require("dotenv").config();

const port = process.env.PORT || 3000;

const sequelize = require("./util/database");
const User = require("./models/user");
const Chat = require("./models/chatHistory");
const Group = require("./models/group");
const Admin = require("./models/admin");
const GroupUser = require("./models/group_user");
const errorRoutes = require("./routes/404");
const userRoutes = require("./routes/userRoutes");
const mainRoutes = require("./routes/mainRoutes");
const groupRoutes = require("./routes/group");
const adminRoutes = require("./routes/admin");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors({ origin: "*", method: ["GET", "POST"] }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("views"));

// Handle a socket connection request from web client
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  // Handle a custom event from the client
  socket.on("send-message", (message) => {
    // console.log(message.message);
    socket.broadcast.emit("receive-message", message);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use("/", userRoutes);
app.use("/home", mainRoutes);
app.use("/group", groupRoutes);
app.use("/admin", adminRoutes);
app.use(errorRoutes);

User.hasMany(Chat);
Chat.belongsTo(User, { constraints: true });

Group.hasMany(Chat);
Chat.belongsTo(Group, { constraints: true });

User.belongsToMany(Group, { through: GroupUser });
Group.belongsToMany(User, { through: GroupUser });

Admin.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Admin, { foreignKey: "userId" });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    server.listen(port, () => {
      console.log("app is listening to port ", port);
    });
  })
  .catch((err) => {
    console.log(err);
  });
