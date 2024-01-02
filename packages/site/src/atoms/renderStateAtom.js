// store/canvasState.js
import { atom } from 'recoil';

export const is3dmodelstate = atom({
  key: 'renderModelState',
  default: false, // default value
});

export const iswasmreadystate = atom({
  key: 'renderWasmReadyState',
  default: false, // default value
});
