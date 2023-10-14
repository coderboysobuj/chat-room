const joinForm = document.querySelector("[data-join-form]");
const chatList = document.querySelector("[data-chat-list]");
const messageInput = document.querySelector("[data-message]");
const messageForm = document.querySelector("[data-message-form]");
const usernameInput = document.querySelector("[data-username]");
const roomInput = document.querySelector("[data-room]");
const activity = document.querySelector("[data-activity]");
const userList = document.querySelector("[data-user-list]");
const roomList = document.querySelector("[data-room-list]");

const socket = io();

joinForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const username = formData.get("username");
  const room = formData.get("room");

  if (!username || !room) return;
  socket.emit("joinRoom", { username, room });
  messageInput.focus();
});

messageForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!messageInput.value || !usernameInput.value || !roomInput.value) return;
  socket.emit("message", {
    username: usernameInput.value,
    text: messageInput.value,
  });

  messageInput.value = "";
  messageInput.focus();
});

messageInput.addEventListener("keypress", () => {
  socket.emit("activity", usernameInput.value);
});

// listen for socket events
socket.on("message", (message) => {
  showMessage(message);
});

// listen for activity
let activityTimer;
socket.on("activity", (username) => {
  activity.textContent = `${username} is typing...`;
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});

// listen for active users
socket.on("userList", ({ users }) => {
  showUsers(users);
});

// listen for all active rooms
socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

// utils function

function showMessage(message) {
  activity.textContent = "";
  const chatItem = document.createElement("li");
  if (message.isAdmin) {
    chatItem.className = "w-full flex flex-col justify-center items-center";
  } else if (message.username === usernameInput.value) {
    chatItem.className = "chat chat-end";
  } else {
    chatItem.className = "chat chat-start";
  }

  const chatHeader = document.createElement("div");
  chatHeader.className = "chat-header";
  chatHeader.textContent =
    message.username === usernameInput.value ? "You" : message.username;
  const chatTime = document.createElement("time");
  chatTime.className = "text-xs opacity-50";
  chatTime.textContent = message.time;
  chatHeader.appendChild(chatTime);

  const chatContent = document.createElement("div");
  if (message.username === usernameInput.value) {
    chatContent.className = "chat-bubble";
  } else if (message.isAdmin) {
    chatContent.className = "chat-bubble";
  } else {
    chatContent.className = `chat-bubble ${message.color}`;
  }
  chatContent.textContent = message.text;

  chatItem.appendChild(chatHeader);
  chatItem.appendChild(chatContent);

  chatList.appendChild(chatItem);
  chatList.scrollTop = chatList.scrollHeight;
}

function showRooms(rooms) {
  roomList.innerHTML = "";
  if (rooms) {
    rooms.forEach((room, i) => {
      const li = document.createElement("li");
      li.className = "cursor-pointer";
      li.setAttribute("data-room", room);
      li.textContent = room;
      if (i < rooms.length - 1) {
        li.textContent += ",";
      }
      roomList.appendChild(li);
    });
  }

  if (roomList.hasChildNodes()) {
    roomList.childNodes.forEach((item) => {
      item.addEventListener("click", function () {
        const room = item.getAttribute("data-room");
        if (room === roomInput.value) return;
        if (roomInput.value && usernameInput.value) {
          const leaveAndJoin = confirm(
            `You are sure you want to leave ${roomInput.value} & join ${room}`
          );

          if (leaveAndJoin) {
            socket.emit("joinRoom", { username: usernameInput.value, room });
            roomInput.value = room;
          }
        }
      });
    });
  }
}

function showUsers(users) {
  userList.innerHTML = "";
  if (users) {
    users.forEach((user, i) => {
      const li = document.createElement("li");
      li.textContent = user.username;
      if (i < users.length - 1) {
        li.textContent += ",";
      }
      userList.appendChild(li);
    });
  }
}
