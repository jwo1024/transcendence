interface ChatRoomStatusProps {
  id: number;
  chatType: "group" | "dm";
}

interface GroupRoomStatusProps extends ChatRoomStatusProps {
  chatType: "group";
  title: string;
  private: boolean;
  password: boolean;
  numOfUser: number;
}
interface DMRoomStatusProps extends ChatRoomStatusProps {
  chatType: "dm";
  title: string;
  friendName: string;
}

interface UserProps {
  id: number;
  userName: string;
}

interface messageProps {
  id: number;
  chatRoomId: number;
  userId: number;
  message: string;
  createdAt: string;
}

export type {
  ChatRoomStatusProps,
  GroupRoomStatusProps,
  DMRoomStatusProps,
  UserProps,
  messageProps,
};
