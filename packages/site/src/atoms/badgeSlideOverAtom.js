import { atom } from 'recoil';

export const currentbadgemetadata = atom({
  key: 'currentBadgeMetadata',
  default: null,
});

export const currentbadgeformstate = atom({
  key: 'currentBadgeForm',
  default: null,
});

export const currentbadgecategories = atom({
  key: 'currentBadgeCategories',
  default: [''],
});
