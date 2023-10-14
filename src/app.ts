import path from "path";
import express from "express";
import { Server } from "socket.io";
import { Message, buildMsg } from "./utils/messages";
import {
  User,
  getAllActiveRooms,
  getUser,
  getUsersInRoom,
  joinUser,
  leaveUser,
} from "./utils/users";

const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const io = new Server(server);
const CHAT_BUBBLE_COLORS = [
  "chat-bubble-primary",
  "chat-bubble-secondary",
  "chat-bubble-accent",
  "chat-bubble-info",
  "chat-bubble-success",
  "chat-bubble-warning",
  "chat-bubble-error",
];
const ADMIN = "ChatBoot";
const APP_NAME = "Chat App";

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected!`);

  // Upon connection - only to user
  // Send welcome message
  socket.emit(
    "message",
    buildMsg({
      username: ADMIN,
      text: `Welcome to ${APP_NAME}.`,
      isAdmin: true,
    })
  );

  socket.on(
    "joinRoom",
    ({ username, room }: Pick<User, "username" | "room">) => {
      // check if user already in a room
      // if then leave previous room

      const prevRoom = getUser(socket.id)?.room;

      if (prevRoom) {
        console.log(prevRoom);
        socket.leave(prevRoom);

        // send a message to all users in previous room
        io.to(prevRoom).emit(
          "message",
          buildMsg({
            username: ADMIN,
            text: `${username} has left the room.`,
            isAdmin: true,
          })
        );
      }
      // remove user from state first
      leaveUser(socket.id);

      // store user in server
      const user = joinUser({
        id: socket.id,
        username,
        room,
        color:
          CHAT_BUBBLE_COLORS[
            Math.floor(Math.random() * CHAT_BUBBLE_COLORS.length)
          ],
      });

      // if previous room send all users to that spacific room for updating UI
      // Cannot update previous room users list until after the state update in activate user
      if (prevRoom) {
        io.to(prevRoom).emit("userList", {
          users: getUsersInRoom(prevRoom),
        });
      }

      // join room

      socket.join(user.room);

      // Admin Send a meesage who joined the room
      socket.emit(
        "message",
        buildMsg({
          username: ADMIN,
          text: `You have joined the ${user.room}.`,
          isAdmin: true,
        })
      );

      // Admin - everyone else in the room notify them
      socket.to(user.room).emit(
        "message",
        buildMsg({
          username: ADMIN,
          text: `${user.username} join the room.`,
          isAdmin: true,
        })
      );

      // Send users list for current room to update UI
      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });

      // update active room list for everyone using this application
      io.emit("roomList", {
        rooms: getAllActiveRooms(),
      });
    }
  );

  // When user disconnects
  socket.on("disconnect", () => {
    // get current user
    const user = getUser(socket.id);
    if (user) {
      // update state
      leaveUser(user.id);
      // Send message to all others user in the room
      io.to(user.room).emit(
        "message",
        buildMsg({
          username: ADMIN,
          text: `${user.username} has left the room`,
          isAdmin: true,
        })
      );
      // send user list for update UI
      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });

      // send active room list to everyone for update UI
      io.emit("roomList", {
        rooms: getAllActiveRooms(),
      });
    }
  });

  // listen for a message event

  socket.on(
    "message",
    ({ username, text }: Pick<Message, "username" | "text">) => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          buildMsg({
            username,
            text: text,
            color: user.color,
          })
        );
      }
    }
  );

  // listen for activity
  socket.on("activity", (username: string) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.to(room).emit("activity", username);
    }
  });
});
