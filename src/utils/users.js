"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllActiveRooms = exports.getUsersInRoom = exports.getUser = exports.leaveUser = exports.joinUser = void 0;
var UserState = {
    users: [],
    setUsers: function (users) {
        this.users = users;
    },
};
function joinUser(user) {
    UserState.setUsers(__spreadArray(__spreadArray([], UserState.users, true), [user], false));
    return user;
}
exports.joinUser = joinUser;
function leaveUser(id) {
    UserState.setUsers(UserState.users.filter(function (user) { return user.id !== id; }));
}
exports.leaveUser = leaveUser;
function getUser(id) {
    return UserState.users.find(function (user) { return user.id === id; });
}
exports.getUser = getUser;
function getUsersInRoom(room) {
    var users = UserState.users.filter(function (user) { return user.room === room; });
    return users;
}
exports.getUsersInRoom = getUsersInRoom;
function getAllActiveRooms() {
    // make user no dublicate room
    var roomSet = new Set(UserState.users.map(function (user) { return user.room; }));
    var rooms = Array.from(roomSet);
    return rooms;
}
exports.getAllActiveRooms = getAllActiveRooms;
