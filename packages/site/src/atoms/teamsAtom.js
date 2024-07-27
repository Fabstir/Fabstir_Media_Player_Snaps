import { atom } from 'recoil';

export const teamsstate = atom({
  key: 'teamsStateAtom',
  default: { teamsName: 'Teams', teams: [] },
});

export const updatenftwithteamsstate = atom({
  key: 'updateNFTWithTeamsStateAtom',
  default: '',
});

export const isupdateteamsstate = atom({
  key: 'isUpdateTeamsStateAtom',
  default: false,
});
