import {
  ChainId,
  NFTData,
  Metadata,
  TranscodeStatus,
  NFTMedia,
} from '../types';

export interface UseNFTMediaReturn {
  getMetadata: (
    key: string | null,
    cidWithoutKey: string,
  ) => Promise<Metadata | undefined>;
  putMetadata: (
    key: string | null,
    cidWithoutKey: string,
    metaData: Metadata,
  ) => Promise<void>;
  hasMetadataMedia: (metaData: Metadata[]) => boolean;
  hasVideoMedia: (metaData: Metadata[]) => boolean;
  hasAudioMedia: (metaData: Metadata[]) => boolean;
  getNFTsMedia: (nfts: NFTData[]) => Promise<NFTMedia[]>;
  putNFTsMedia: (nftsMedia: NFTMedia[]) => Promise<void>;
  getTranscodePending: (cid: string) => Promise<TranscodeStatus | undefined>;
  setTranscodePending: (
    cid: string,
    taskId: string,
    isEncrypted?: boolean,
  ) => Promise<void>;
  getTranscodedMetadata: (taskId: string) => Promise<Metadata | undefined>;
  deleteTranscodePending: (cid: string) => void;
  getTranscodeProgress: (taskId: string) => Promise<number | undefined>;
  updateTranscodesCompleted: () => Promise<void>;
  removeExtension: (cid: string) => string;
  getMetadataFromUser: (
    userPub: string,
    key: string | null,
    cidWithoutKey: string,
  ) => Promise<Metadata | undefined>;
  unlockVideoFromController: (
    userPub: string,
    address: string,
    id: string,
    additionalMetaData?: Record<string, any>,
  ) => Promise<void>;
  unlockNestableKeysFromController: (
    userPub: string,
    nft: NFTData,
    getIsNestableNFT: (address: string) => Promise<boolean>,
    getChildrenOfNestableNFT: (id: string) => Promise<NFTData[]>,
  ) => Promise<void>;
}

declare const useNFTMedia: () => UseNFTMediaReturn;

export default useNFTMedia;
