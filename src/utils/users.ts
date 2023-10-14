export interface User {
  id: string;
  username: string;
  room: string;
  color: string;
}

interface IUserState {
  users: User[];
  setUsers: (users: User[]) => void;
}

const UserState: IUserState = {
  users: [],
  setUsers: function (users) {
    this.users = users;
  },
};

export function joinUser(user: User): User {
  UserState.setUsers([...UserState.users, user]);
  return user;
}

export function leaveUser(id: string) {
  UserState.setUsers(UserState.users.filter((user) => user.id !== id));
}

export function getUser(id: string): User | undefined {
  return UserState.users.find((user) => user.id === id);
}

export function getUsersInRoom(room: string): User[] {
  const users = UserState.users.filter((user) => user.room === room);
  return users;
}

export function getAllActiveRooms(): string[] {
  // make user no dublicate room
  const roomSet = new Set(UserState.users.map((user) => user.room));
  const rooms = Array.from(roomSet);
  return rooms;
}
