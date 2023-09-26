// chat socket event name
// emit
export const EMIT_DM_CREATE = "DM-create";
export const EMIT_ROOM_CREATE = "Room-create";
export const EMIT_ROOM_JOIN = "Room-join";
export const EMIT_ROOM_LEAVE = "Room-leave";
export const EMIT_MESSAGE_ADD = "Message-add";
export const EMIT_OWNER_ROOM_EDIT = "Owner-Room-edit";
export const EMIT_ADMIN_ADD = "Admin-add";
export const EMIT_ADMIN_KICK = "Admin-kick";
export const EMIT_ADMIN_BAN = "Admin-Ban";
export const EMIT_ADMIN_MUTE = "Admin-mute";
export const EMIT_ADD_USER_BLOCK = "add-user-block";
export const EMIT_ROOM_INVITE = "Room-invite";
export const EMIT_ROOM_ENTER = "Room-enter";
export const EMIT_GET_USER_PROFILE = "get-user-profile";
export const EMIT_GET_USERS = "get-users";
export const EMIT_GAME_INVITE = "Game-invite";
export const EMIT_REFUSE_GAME_INVITE = "Refuse-Game-invite";
// on
export const ON_ROOMS = "rooms";
export const ON_ME_JOINING_ROOMS = "me-joining-rooms";
// export const ON_NEW_JOIN_ROOM = "new_join_room";
export const ON_MESSAGES_ROOMID = "messages_";
export const ON_MESSAGE_ADDED_ROOMID = "messageAdded_";
export const ON_INVITE_TO_CHAT = "invite-to-chat";
export const ON_USER_PROFILE_INFO = "user-profile-info";
export const ON_GOT_MUTED_ROOMID = "got-muted_";
export const ON_GOT_KICKED_ROOMID = "got-kicked_";
export const ON_GOT_BANNED_ROOMID = "got-banned_";
export const ON_GOT_INVITED_TO_GAME = "got-invited-to-game";
export const ON_MY_BLOCK_LIST = "my-block-list";
export const ON_CURRENT_ROOM_ROOMID = "current-room_";
export const ON_VISIBLE_ROOMS = "visible_rooms";
export const ON_BAD_REQUEST = "Bad-request"; // ?
export const ON_CURRENT_USERS_ROOMID = "current-users_";

// response
export const ON_RESPONSE_DM_CREATE = "Response-DM-create";
export const ON_RESPONSE_ROOM_CREATE = "Response-Room-create";
export const ON_RESPONSE_ADMIN_MUTE = "Response-Admin-mute";
export const ON_RESPONSE_ROOM_INVITE = "Response-Room-invite";
export const ON_RESPONSE_ROOM_ENTER_ROOMID = "Response-Room-enter_";
export const ON_RESPONSE_ROOM_LEAVE = "Response-Room-leave";
export const ON_RESPONSE_MESSAGE_ADD = "Response-Message-add";
export const ON_RESPONSE_ADMIN_ADD = "Response-Admin-add";
export const ON_RESPONSE_ADMIN_KICK = "Response-Admin-kick";
export const ON_RESPONSE_ADMIN_BAN = "Response-Admin-Ban";
export const ON_RESPONSE_ROOM_JOIN = "Response-Room-join";
export const ON_RESPONSE_GET_USERS = "Response-get-users";
export const ON_RESPONSE_GET_USER_PROFILE = "Response-get-user-profile";

export const ON_RESPONSE_OWNER_ROOM_EDIT = "Response-Owner-Room-edit";

export const ON_RESPONSE_GAME_INVITE = "Response-Game-invite";

// "get-users""current-users_${roomId}"
// "Response-get-users"
// 추천 by copilot
export const ON_ANY = "onAny";
export const ON_ERROR = "error";
export const ON_DISCONNECT = "disconnect";
export const ON_CONNECT = "connect";
// export const ON_CONNECT_ERROR = "connect_error";
// export const ON_CONNECT_TIMEOUT = "connect_timeout";
export const ON_RECONNECT = "reconnect";
// export const ON_RECONNECT_ATTEMPT = "reconnect_attempt";
// export const ON_RECONNECTING = "reconnecting";
// export const ON_RECONNECT_ERROR = "reconnect_error";
// export const ON_RECONNECT_FAILED = "reconnect_failed";
// export const ON_PING = "ping";
// export const ON_PONG = "pong";
// export const ON_ROOM_ENTER = "Room-enter";
// export const ON_ROOM_LEAVE = "Room-leave";
// export const ON_ROOM_JOIN = "Room-join";
