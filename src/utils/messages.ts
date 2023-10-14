export interface Message {
  username: string;
  text: string;
  time: string;
  isAdmin?: boolean;
  color?: string;
}
export function buildMsg(
  message: Pick<Message, "username" | "text" | "isAdmin" | "color">
): Message {
  return {
    ...message,
    time: Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      dayPeriod: "short",
    }).format(new Date()),
  };
}
