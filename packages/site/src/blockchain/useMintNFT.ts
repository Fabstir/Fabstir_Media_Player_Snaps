import { Interface } from '@ethersproject/abi';
import { Zero, One } from '@ethersproject/constants';

import { useContext } from 'react';
import IERC165 from '../../contracts/IERC165.json';
import TipERC721 from '../../contracts/TipERC721.json';
import TipERC1155 from '../../contracts/TipERC1155.json';
import { convertAttributesToNFT721Convention } from '../utils/nftUtils';

import { getSmartAccountAddress } from './useAccountAbstractionPayment';

import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';
import FNFTFactoryTipERC721 from '../../contracts/FNFTFactoryTipERC721.json';
import FNFTFactoryTipERC1155 from '../../contracts/FNFTFactoryTipERC1155.json';

import usePortal from '../hooks/usePortal';

import useAccountAbstractionPayment from './useAccountAbstractionPayment';
import useContractUtils from './useContractUtils';
import { AccountAbstractionPayment } from '../../types';
import useUserProfile from '../hooks/useUserProfile';
import useIPFS from '../hooks/useIPFS';
import useS5net from '../hooks/useS5';
import { getAddressFromContractEvent } from '../utils/blockchainUtils';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../atoms/userAuthAtom';

const erc721InterfaceId = 0x80ac58cd;
const erc1155InterfaceId = 0xd9b67a26;

type NFT = {
  name?: string;
  symbol?: string;
  supply?: string;
  [key: string]: any;
};

type MintNFTResponse = {
  address: string;
  id: string;
  uri: string;
};

export default function useMintNFT() {
  const blockchainContext =
    useContext<BlockchainContextType>(BlockchainContext);
  const { providers, connectedChainId, smartAccountProvider, smartAccount } =
    blockchainContext;
  console.log('useMintNFT: providers = ', providers);
  console.log('useMintNFT: smartAccountProvider = ', smartAccountProvider);

  const userAuthPub = useRecoilValue(userauthpubstate);
  const [getUserProfile] = useUserProfile();

  const {
    getChainIdAddressFromContractAddresses,
    newReadOnlyContract,
    newContract,
  } = useContractUtils();

  const { processTransactionBundle } = useAccountAbstractionPayment(
    smartAccount as object,
  ) as AccountAbstractionPayment;

  const { uploadFile } = usePortal(
    process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK,
  ) as {
    uploadFile: (file: File) => Promise<string>;
  };

  if (
    !providers ||
    Object.keys(providers).length === 0 ||
    !smartAccountProvider ||
    !smartAccount
  ) {
    console.log(
      'useMintNFT: smartAccountProvider or smartAccount is null or no providers',
    );
    return {
      mintNFT: async () => {
        throw new Error('Cannot mint NFT: smartAccount is not defined');
      },
      getIsERC721: async () => {
        throw new Error(
          'Cannot check if NFT is ERC721: smartAccount is not defined',
        );
      },
      getIsERC721Address: async () => {
        throw new Error(
          'Cannot check if NFT address is ERC721: smartAccount is not defined',
        );
      },
    };
  }

  type ExtendedBlobPropertyBag = BlobPropertyBag & {
    lastModified?: number;
  };

  const ipfs = useIPFS();
  const s5 = useS5net();

  let defaultStorage: any;
  if (process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK === 'ipfs')
    defaultStorage = ipfs;
  else defaultStorage = s5;

  /**
   * Asynchronously mints a new NFT.
   *
   * @param {NFT} nft - The NFT to be minted.
   * @returns {Promise<MintNFTResponse>} - A promise that resolves to the response of the minting operation.
   */
  const mintNFT = async (
    userPub: string,
    nft: NFT,
  ): Promise<MintNFTResponse> => {
    const userProfile = await getUserProfile(userPub);

    //    const smartAccount = await connectToWallet()
    //    const smartAccountAddress = await signerAccount.getAddress()

    const smartAccountAddress = await getSmartAccountAddress(smartAccount);
    console.log(`useMintNFT: smartAccountAddress = `, smartAccountAddress);

    if (
      userProfile.accountAddress.toLowerCase() !==
      smartAccountAddress.toLowerCase()
    ) {
      throw new Error(
        'useMintNFT:Please connect to your registered wallet account and try again.',
      );
    }

    if (
      !nft ||
      nft.supply === undefined ||
      !Number.isInteger(nft.supply) ||
      +nft.supply < 1
    )
      throw new Error(
        'useMintNFT:NFT supply is required and must be a whole number',
      );

    let nftMetaData = { ...nft };
    // if (!nftMetaData.deployed) {
    //   delete nftMetaData.name;
    //   delete nftMetaData.symbol;
    // }
    delete nftMetaData.supply;
    delete nftMetaData.members;
    delete nftMetaData.address;
    delete nftMetaData.tokenise;
    delete nftMetaData.badgesGated;
    delete nftMetaData.playlist;
    console.log('useMintNFT: nftMetaData = ', nftMetaData);

    if (nftMetaData.attributes)
      nftMetaData.attributes = convertAttributesToNFT721Convention(
        nftMetaData.attributes,
      );

    const metaDataFileObject = new File(
      [
        new Blob([JSON.stringify(nftMetaData)], {
          lastModified: Date.now(), // optional - default = now
          type: 'text/plain', // optional - default = ''
        }),
      ],
      'ERC721Metadata.json',
    );

    const cid = await defaultStorage.uploadFile(metaDataFileObject);
    console.log(`useMintNFT: cid = ${cid} for storage ${defaultStorage}`);

    let nftAddress = '';
    let tokenId;

    console.log('useMintNFT: 1');

    if (!nft.multiToken) {
      if (nft.deployed) {
        // Deploy ERC-721 using smart account
        const fnftFactoryTipNFTAddress = getChainIdAddressFromContractAddresses(
          connectedChainId as number,
          'NEXT_PUBLIC_FNFTFACTORY_TIPNFTERC721_ADDRESS',
        );

        const fnftFactoryTipNFT = newContract(
          fnftFactoryTipNFTAddress,
          FNFTFactoryTipERC721.abi,
          smartAccountProvider,
        );

        const { receipt } = await processTransactionBundle([
          [
            await fnftFactoryTipNFT.populateTransaction.deploy(
              nft.name,
              nft.symbol,
            ),
            fnftFactoryTipNFTAddress,
          ],
        ]);

        const iface = new Interface(FNFTFactoryTipERC721.abi);
        const parsedLogs = receipt.logs.map((log: any) => {
          try {
            return iface.parseLog(log);
          } catch (e) {
            return null;
          }
        });

        // Filter out null values and find the Transfer event
        const transferLog = parsedLogs.find(
          (log: any) => log && log.name === 'TipNFTCreated',
        );

        if (transferLog) {
          nftAddress = transferLog.args.tipNFTAddress;
          nftAddress = `${connectedChainId}:${nftAddress}`;

          console.log('useMintNFT: tipNFTAddress:', nftAddress);
        } else {
          const errMessage = 'useMintNFT: TipNFTCreated event not found';
          console.error(errMessage);
          throw new Error(errMessage);
        }
      } else
        nftAddress = getChainIdAddressFromContractAddresses(
          connectedChainId as number,
          'NEXT_PUBLIC_TIPERC721_ADDRESS',
        );

      const userOps = [];

      console.log(
        'useMintNFT: process_env.TIPERC721_ADDRESS',
        process.env.NEXT_PUBLIC_TIPERC721_ADDRESS,
      );
      console.log('useMintNFT: nftAddress = ', nftAddress);
      console.log('useMintNFT: smartAccountAddress = ', smartAccountAddress);
      console.log('useMintNFT: cid = ', cid);

      // const isERC721 = await getIsERC721Address(nftAddress)
      // console.log('useMintNFT: isERC721 = ', isERC721)

      const tipERC721Contract = newContract(
        nftAddress,
        TipERC721.abi,
        smartAccountProvider,
      );

      userOps.push([
        await tipERC721Contract.populateTransaction.safeMint(
          smartAccountAddress,
          cid,
        ),
        nftAddress,
      ]);

      console.log(`useMintNFT: userOps = `, userOps);

      console.log(`useMintNFT: before await processTransactionBundle(userOps)`);

      const result = await processTransactionBundle(userOps);
      console.log(`useMintNFT: result = `, result);

      const receipt = result.receipt;

      const iface = new Interface(TipERC721.abi);
      const parsedLogs = receipt.logs.map((log: any) => {
        try {
          return iface.parseLog(log);
        } catch (e) {
          return null;
        }
      });

      // Filter out null values and find the Transfer event
      const transferLog = parsedLogs.find(
        (log: any) => log && log.name === 'Transfer',
      );

      if (transferLog) {
        console.log(
          'useMintNFT: Token ID:',
          transferLog.args.tokenId.toString(),
        );
      } else {
        const errMessage = 'useMintNFT: Transfer event not found';
        console.error(errMessage);
        throw new Error(errMessage);
      }

      tokenId = transferLog?.args.tokenId;

      const userOps2 = [];

      // Save playlist NFT addresses
      if (nft.playlist) {
        const playlist: any[] = [];
        nft.playlist.forEach((nft: NFT) => {
          playlist.push({ address: nft.address, id: nft.id });
        });

        const addresses = playlist.map((nft) => nft.address);
        const ids = playlist.map((nft) => nft.id);

        userOps2.push([
          await tipERC721Contract.populateTransaction.addNFTs(
            tokenId,
            addresses,
            ids,
          ),
          nftAddress,
        ]);
      }

      if (userOps2.length > 0) await processTransactionBundle(userOps2);
    } else {
      if (nft.deployed) {
        // Deploy ERC-1155 using smart account
        const fnftFactoryTipNFTAddress = getChainIdAddressFromContractAddresses(
          connectedChainId as number,
          'NEXT_PUBLIC_FNFTFACTORY_TIPNFTERC1155_ADDRESS',
        );

        const fnftFactoryTipNFT = newContract(
          fnftFactoryTipNFTAddress,
          FNFTFactoryTipERC1155.abi,
          smartAccountProvider,
        );

        const { receipt } = await processTransactionBundle([
          [
            await fnftFactoryTipNFT.populateTransaction.deploy(),
            fnftFactoryTipNFTAddress,
          ],
        ]);

        nftAddress = getAddressFromContractEvent(
          receipt,
          FNFTFactoryTipERC1155.abi,
          'TipNFTCreated',
          'tipNFTAddress',
        );

        nftAddress = `${connectedChainId}:${nftAddress}`;

        tokenId = 1;
      } else
        nftAddress = getChainIdAddressFromContractAddresses(
          connectedChainId as number,
          'NEXT_PUBLIC_TIPERC1155_ADDRESS',
        );

      console.log('useMintNFT: tipNFTAddress:', nftAddress);

      const tipERC1155Contract = newContract(
        nftAddress,
        TipERC1155.abi,
        smartAccountProvider,
      );

      console.log(`useMintNFT: before await processTransactionBundle(userOps)`);
      const { receipt: receipt2 } = await processTransactionBundle([
        [
          await tipERC1155Contract.populateTransaction.mintToken(
            smartAccountAddress,
            0,
            cid,
            nft.supply,
            [],
          ),
          nftAddress,
        ],
      ]);

      // Get the NFT token ID
      tokenId = getAddressFromContractEvent(
        receipt2,
        TipERC1155.abi,
        'TransferSingle',
        3,
      );

      const userOps3 = [];

      if (nft.playlist) {
        const playlist: any[] = [];
        nft.playlist.forEach((nft: NFT) => {
          playlist.push({ address: nft.address, id: nft.id });
        });

        const addresses = playlist.map((nft) => nft.address);
        const ids = playlist.map((nft) => nft.id);

        userOps3.push([
          await tipERC1155Contract.populateTransaction.addNFTs(
            tokenId,
            addresses,
            ids,
          ),
          nftAddress,
        ]);
      }

      if (userOps3.length > 0) await processTransactionBundle(userOps3);
    }

    console.log(
      `useMintNFT: { address: ${nftAddress}, id: ${tokenId
        .toNumber()
        .toString()}, uri: ${cid} }`,
    );

    return { address: nftAddress, id: tokenId.toNumber().toString(), uri: cid };
  };

  // call ERC-165 supportsInterface
  // return true if interface ERC-721 is supported
  const getIsERC721 = async (nft: any) => {
    if (!nft?.address) return false;

    return getIsERC721Address(nft.address);
  };

  // call ERC-165 supportsInterface
  // return true if interface ERC-721 is supported
  const getIsERC721Address = async (nftAddress: string): Promise<boolean> => {
    if (!nftAddress) return false;

    const iERC165 = newReadOnlyContract(nftAddress, IERC165.abi);

    console.log('getIsERC721Address: before getIsERC721Address result');

    let result;
    try {
      result = await iERC165.supportsInterface(erc721InterfaceId);
      // Handle success, e.g., console.log(result);
    } catch (error) {
      console.error(
        'getIsERC721Address: Error checking if the contract supports ERC721 interface:',
        error,
      );
    }
    console.log('getIsERC721Address: getIsERC721Address result = ', result);

    return result;
  };

  // call ERC-165 supportsInterface
  // return true if interface ERC-1155 is supported
  const getIsERC1155Address = async (nftAddress: string): Promise<boolean> => {
    if (!nftAddress) return false;

    const iERC165 = newReadOnlyContract(nftAddress, IERC165.abi);

    console.log('getIsERC1155Address: before getIsERC1155Address result');

    let result;
    try {
      result = await iERC165.supportsInterface(erc1155InterfaceId);
      // Handle success, e.g., console.log(result);
    } catch (error) {
      console.error(
        'getIsERC1155Address: Error checking if the contract supports ERC1155 interface:',
        error,
      );
    }
    console.log('getIsERC1155Address: getIsERC1155Address result = ', result);

    return result;
  };

  // call ERC-165 supportsInterface
  // return true if interface ERC-1155 is supported
  const getIsERC1155 = async (nft: any) => {
    if (!nft?.address) return false;

    const iERC165 = newReadOnlyContract(nft.address, IERC165.abi);

    const result = await iERC165.supportsInterface(erc1155InterfaceId);
    return result;
  };

  const getIsOwnNFT = async (userAccountAddress: string, nft: any) => {
    if (!userAccountAddress || !nft.address || !nft.id) return false;

    let isOwnNFT;
    if (await getIsERC721(nft)) {
      const tipERC721 = newReadOnlyContract(nft.address, TipERC721.abi);
      const ownerAddress = await tipERC721.ownerOf(nft.id);
      console.log('getIsOwnNFT: ownerAddress = ', ownerAddress);

      try {
        isOwnNFT =
          (await tipERC721.ownerOf(nft.id))?.toLowerCase() ===
          userAccountAddress.toLowerCase();
      } catch (error) {
        console.error(`getIsOwnNFT: Failed to get owner of token: ${error}`);
        // Handle the error appropriately here
      }
    } else if (await getIsERC1155(nft)) {
      const tipERC1155 = newReadOnlyContract(nft.address, TipERC1155.abi);
      try {
        isOwnNFT = (await tipERC1155.balanceOf(userAccountAddress, nft.id)) > 0;
      } catch (error) {
        console.error(
          `getIsOwnNFT: Failed to get whether owner of token: ${error}`,
        );
        // Handle the error appropriately here
      }
    }

    console.log('getIsOwnNFT: isOwnNFT = ', isOwnNFT);

    return isOwnNFT;
  };

  const transferNFT = async (
    nft: NFT,
    recipientAccountAddress: string,
    quantity: number = 1,
  ): Promise<boolean> => {
    if (!connectedChainId) throw new Error('Connected chain ID is not defined');

    const userAuthProfile = await getUserProfile(userAuthPub);

    const nftAddress = nft.address;

    if (await getIsERC721(nft)) {
      if (quantity !== 1) throw new Error('Quantity must be 1');

      const tipERC721Contract = newContract(
        nft.address,
        TipERC721.abi,
        smartAccountProvider,
      );

      const { receipt } = await processTransactionBundle([
        [
          await tipERC721Contract.populateTransaction.transferFrom(
            userAuthProfile.accountAddress,
            recipientAccountAddress,
            nft.id,
          ),
          nftAddress,
        ],
      ]);

      console.log('transferNFT: receipt = ', receipt);
      return receipt.isSuccess;
    } else if (await getIsERC1155(nft)) {
      if (quantity < 1) throw new Error('Quantity must be 1 or more');

      const tipERC1155Contract = newContract(
        nft.address,
        TipERC1155.abi,
        smartAccountProvider,
      );

      const { receipt } = await processTransactionBundle([
        [
          await tipERC1155Contract.populateTransaction.safeTransferFrom(
            userAuthProfile.accountAddress,
            recipientAccountAddress,
            nft.id,
            quantity,
            [],
          ),
          nftAddress,
        ],
      ]);

      console.log('transferNFT: receipt = ', receipt);
      return receipt.isSuccess;
    } else throw new Error('NFT is not ERC721 or ERC1155');
  };

  const getOwnNFTs = async (userAccountAddress: string, nfts: any) => {
    if (!nfts) return [];

    const ownNFTs = [];

    for (const idx in nfts) {
      const nft = nfts[idx];

      if (await getIsOwnNFT(userAccountAddress, nft)) ownNFTs.push(nft);
    }

    return ownNFTs;
  };

  const getNFTQuantity = async (userPub: string, nft: any) => {
    const userAuthProfile = await getUserProfile(userPub);

    let quantity = Zero;
    if (await getIsERC721(nft)) {
      const isOwnNFT = await getIsOwnNFT(userAuthProfile.accountAddress, nft);
      if (isOwnNFT) quantity = One;
    } else if (await getIsERC1155(nft)) {
      const tipERC1155 = newReadOnlyContract(nft.address, TipERC1155.abi);
      quantity = await tipERC1155.balanceOf(
        userAuthProfile.accountAddress,
        nft.id,
      );
    }

    console.log('getNFTQuantity: quantity = ', quantity);
    return quantity;
  };

  return {
    mintNFT,
    getIsERC721,
    getIsERC721Address,
    getIsERC1155Address,
    getIsERC1155,
    getIsOwnNFT,
    getOwnNFTs,
    getNFTQuantity,
    transferNFT,
  };
}
