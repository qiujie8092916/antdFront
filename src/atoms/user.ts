import { atom } from 'recoil';

export interface Member {
  avatar: string;
  name: string;
  id: string;
}
export interface CurrentUser {
  id?: string;
  name?: string;
  title?: string;
  avatar?: string;
  group?: Member[];
  signature?: string;
  unreadCount?: number;
  tags?: {
    key: string;
    label: string;
  }[];
  [p: string]: any;
}

export const currentUserAtom = atom<CurrentUser>({
  key: 'currentUserAtom',
  default: {}
});
