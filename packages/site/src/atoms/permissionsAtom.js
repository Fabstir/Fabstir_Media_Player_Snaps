import { atom } from 'recoil';

export const permissionsstate = atom({
  key: 'permissionsStateAtom',
  default: { permissionsName: 'Permissions', permissions: [] },
});

export const updatenftwithpermissionsstate = atom({
  key: 'updateNFTWithPermissionsStateAtom',
  default: '',
});

export const isupdatepermissionsstate = atom({
  key: 'isUpdatePermissionsStateAtom',
  default: false,
});
