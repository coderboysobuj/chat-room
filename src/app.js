"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var express_1 = require("express");
var socket_io_1 = require("socket.io");
var messages_1 = require("./utils/messages");
var users_1 = require("./utils/users");
var app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
var PORT = process.env.PORT || 8000;
var server = app.listen(PORT, function () {
    return console.log("Server running on port ".concat(PORT));
});
var io = new socket_io_1.Server(server);
var CHAT_BUBBLE_COLORS = [
    "chat-bubble-primary",
    "chat-bubble-secondary",
    "chat-bubble-accent",
    "chat-bubble-info",
    "chat-bubble-success",
    "chat-bubble-warning",
    "chat-bubble-error",
];
var ADMIN = "ChatBoot";
var APP_NAME = "Chat App";
io.on("connection", function (socket) {
    console.log("User ".concat(socket.id, " connected!"));
    // Upon connection - only to user
    // Send welcome message
    socket.emit("message", (0, messages_1.buildMsg)({
        username: ADMIN,
        text: "Welcome to ".concat(APP_NAME, "."),
        isAdmin: true,
    }));
    socket.on("joinRoom", function (_a) {
        // check if user already in a room
        // if then leave previous room
        var _b;
        var username = _a.username, room = _a.room;
        var prevRoom = (_b = (0, users_1.getUser)(socket.id)) === null || _b === void 0 ? void 0 : _b.room;
        if (prevRoom) {
            console.log(prevRoom);
            socket.leave(prevRoom);
            // send a message to all users in previous room
            io.to(prevRoom).emit("message", (0, messages_1.buildMsg)({
                username: ADMIN,
                text: "".concat(username, " has left the room."),
                isAdmin: true,
            }));
        }
        // remove user from state first
        (0, users_1.leaveUser)(socket.id);
        // store user in server
        var user = (0, users_1.joinUser)({
            id: socket.id,
            username: username,
            room: room,
            color: CHAT_BUBBLE_COLORS[Math.floor(Math.random() * CHAT_BUBBLE_COLORS.length)],
        });
        // if previous room send all users to that spacific room for updating UI
        // Cannot update previous room users list until after the state update in activate user
        if (prevRoom) {
            io.to(prevRoom).emit("userList", {
                users: (0, users_1.getUsersInRoom)(prevRoom),
            });
        }
        // join room
        socket.join(user.room);
        // Admin Send a meesage who joined the room
        socket.emit("message", (0, messages_1.buildMsg)({
            username: ADMIN,
            text: "You have joined the ".concat(user.room, "."),
            isAdmin: true,
        }));
        // Admin - everyone else in the room notify them
        socket.to(user.room).emit("message", (0, messages_1.buildMsg)({
            username: ADMIN,
            text: "".concat(user.username, " join the room."),
            isAdmin: true,
        }));
        // Send users list for current room to update UI
        io.to(user.room).emit("userList", {
            users: (0, users_1.getUsersInRoom)(user.room),
        });
        // update active room list for everyone using this application
        io.emit("roomList", {
            rooms: (0, users_1.getAllActiveRooms)(),
        });
    });
    // When user disconnects
    socket.on("disconnect", function () {
        // get current user
        var user = (0, users_1.getUser)(socket.id);
        if (user) {
            // update state
            (0, users_1.leaveUser)(user.id);
            // Send message to all others user in the room
            io.to(user.room).emit("message", (0, messages_1.buildMsg)({
                username: ADMIN,
                text: "".concat(user.username, " has left the room"),
                isAdmin: true,
            }));
            // send user list for update UI
            io.to(user.room).emit("userList", {
                users: (0, users_1.getUsersInRoom)(user.room),
            });
            // send active room list to everyone for update UI
            io.emit("roomList", {
                rooms: (0, users_1.getAllActiveRooms)(),
            });
        }
    });
    // listen for a message event
    socket.on("message", function (_a) {
        var username = _a.username, text = _a.text;
        var user = (0, users_1.getUser)(socket.id);
        if (user) {
            io.to(user.room).emit("message", (0, messages_1.buildMsg)({
                username: username,
                text: text,
                color: user.color,
            }));
        }
    });
    // listen for activity
    socket.on("activity", function (username) {
        var _a;
        var room = (_a = (0, users_1.getUser)(socket.id)) === null || _a === void 0 ? void 0 : _a.room;
        if (room) {
            socket.to(room).emit("activity", username);
        }
    });
});
