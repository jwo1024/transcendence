
// chat room
interface ChatRoomInfo {
	chatType: "group";
  id: number;
  title: string;
  isPublic: boolean;
  password: boolean;
  numOfUser: number;
}

interface ChatRoomListInfo {
  list: ChatRoomInfo[];
};

interface DMRoomInfo {
  chatType: "dm";
  title: string;
  friendName: string;
}


// message
interface UserInfo {
  id: number;
  name: string;
}

interface MessageInfo {
  chatRoomId: number;
  user : UserInfo;
  message: string;
  createdAt: string; // DATE
}

export type {
  ChatRoomInfo,
  DMRoomInfo,
  UserInfo,
  MessageInfo,
  ChatRoomListInfo
};
