
interface ChatRoomInfo {
	chatType: "group";
  id: number;
  title: string;
  isPublic: boolean;
  password: boolean;
  numOfUser: number;
}

type ChatRoomListInfo = {
  list: ChatRoomInfo[];
};

interface DMRoomInfo {
  chatType: "dm";
  title: string;
  friendName: string;
}

interface UserInfo {
  id: number;
  userName: string;
}

interface MessageInfo {
  chatRoomId: number;
  user : UserInfo;
  message: string;
  createdAt: string;
}

export type {
  ChatRoomInfo,
  DMRoomInfo,
  UserInfo,
  MessageInfo,
  ChatRoomListInfo
};
