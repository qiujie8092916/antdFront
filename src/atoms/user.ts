import { atom } from 'recoil';

export interface Member {
  avatar: string;
  name: string;
  id: string;
}
export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: Member[];
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  id?: string;
  unreadCount?: number;
  [p: string]: any;
}

export const currentUserAtom = atom<CurrentUser>({
  key: 'currentUserAtom',
  default: {}
});
