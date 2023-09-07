import { User42Dto } from "./User42Dto";

interface UserInfo {
  id: User42Dto["id"];
  nickname: string;
  user42Dto?: User42Dto;
}

export type { UserInfo };
