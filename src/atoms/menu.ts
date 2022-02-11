import { atom, selector } from 'recoil';

import { Application } from '@/services/application';

export interface Menu {
  haveApplications: Application[];
  otherApplications: Application[];
}

export const menuAtom = atom<Menu>({
  key: 'menuAtom',
  default: {
    haveApplications: [],
    otherApplications: []
  }
});

export const haveApplicationsSelector = selector<Application[]>({
  key: 'haveApplicationsSelector',
  get: ({ get }) => get(menuAtom).haveApplications
});

export const otherApplicationsSelector = selector<Application[]>({
  key: 'otherApplicationsSelector',
  get: ({ get }) => get(menuAtom).otherApplications
});
