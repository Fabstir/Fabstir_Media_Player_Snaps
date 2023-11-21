import { Contract, ContractFactory } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits } from '@ethersproject/units';

import { useContext } from 'react';
import IERC165 from '../../contracts/IERC165.json';
import TipERC721 from '../../contracts/TipERC721.json';

import { useRecoilValue } from 'recoil';
import BlockchainContext, {
  BlockchainContextType,
} from '../../state/BlockchainContext';

import config from '../../config.json';

import usePortal from '../hooks/usePortal';

import { connectToWallet } from '../utils/connectToWallet';
import { currencycontractaddressesstate } from '../atoms/currenciesAtom';
import { Transaction } from '@biconomy/core-types';
import useBiconomyPayment from './useBiconomyPayment';

interface NFT {
  name?: string;
  symbol?: string;
  supply?: string;
  [key: string]: any;
}

interface MintNFTResponse {
  address: string;
  id: string;
  uri: string;
}

/**
 * Custom hook to mint a new NFT.
 * It takes the NFT metadata as an argument, and returns a function to mint the new NFT.
 *
 * @function
 * @returns {Function} The function to mint the new NFT.
 */
export default function useMintNFT() {
  const currencyContractAddresses = useRecoilValue(
    currencycontractaddressesstate,
  );

  const blockchainContext =
    useContext<BlockchainContextType>(BlockchainContext);
  const { provider, smartAccountProvider, smartAccount } = blockchainContext;
  console.log('useMintNFT: provider = ', provider);
  console.log('useMintNFT: smartAccountProvider = ', smartAccountProvider);

  const {
    handleBiconomyPayment,
    handleBiconomyPaymentSponsor,
    createTransaction,
  } = useBiconomyPayment(provider, smartAccountProvider, smartAccount);

  const { uploadFile } = usePortal();

  let nftAddress = '';
  const nftTokenId = 1;

  interface ExtendedBlobPropertyBag extends BlobPropertyBag {
    lastModified?: number;
  }

  /**
   * Function to mint a new sponsored NFT.
   * It takes the NFT metadata as an argument and mints the new NFT using the TipERC721 contract.
   *
   * @async
   * @function
   * @param {NFT} nft - The NFT metadata.
   * @returns {Promise<MintNFTResponse>} The response containing the NFT address, ID, and URI.
   */
  const mintNFTSponsored = async (nft: NFT): Promise<MintNFTResponse> => {
    const signerAccount = await connectToWallet();
    const signerAccountAddress = await signerAccount.getAddress();

    let nftMetaData = { ...nft };
    delete nftMetaData.supply;
    console.log('useMintNFT: nftMetaData = ', nftMetaData);

    const metaDataFileObject = new File(
      [
        new Blob([JSON.stringify(nftMetaData)], {
          lastModified: Date.now(),
          type: 'text/plain',
        } as ExtendedBlobPropertyBag),
      ],
      'ERC721Metadata.json',
    );
    const cid = await uploadFile(metaDataFileObject);
    console.log('useMintNFT: cid = ', cid);

    const nftAddress = process.env.NEXT_PUBLIC_TIPERC721_ADDRESS;

    let tokenId: any;
    if (smartAccountProvider) {
      const contract = new Contract(
        nftAddress as string,
        TipERC721.abi,
        smartAccountProvider,
      );

      const minTx = await contract.populateTransaction.safeMint(
        signerAccountAddress,
        cid,
      );
      console.log(minTx.data);
      const tx1 = {
        to: nftAddress,
        data: minTx.data,
      };
      console.log('useMintNFT:: here before userop');

      if (smartAccount) {
        if (tx1.to === undefined) {
          throw new Error('useMintNFT: tx1.to is undefined');
        }

        console.log('useMintNFT: smartAccount = ', smartAccount);
        console.log('useMintNFT: tx1 = ', tx1);
        let userOp = await smartAccount.buildUserOp([tx1 as Transaction]);
        console.log('useMintNFT: { userOp } = ', { userOp });

        const userOpResponse = await handleBiconomyPaymentSponsor(userOp);
        console.log('useMintNFT: userOpHash', userOpResponse);

        const { receipt } = await userOpResponse.wait(1);
        console.log('useMintNFT: receipt = ', receipt);

        const iface = new Interface(TipERC721.abi);
        const parsedLogs = receipt.logs.map((log) => {
          try {
            return iface.parseLog(log);
          } catch (e) {
            return null;
          }
        });

        // Filter out null values and find the Transfer event
        const transferLog = parsedLogs.find(
          (log) => log && log.name === 'Transfer',
        );

        if (transferLog) {
          console.log(
            'useMintNFT: Token ID:',
            transferLog.args.tokenId.toString(),
          );
        } else {
          console.log('useMintNFT:Transfer event not found');
        }

        tokenId = transferLog?.args.tokenId;
      } else {
        const errorMessage = 'smartAccount is null';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } else {
      const errorMessage = 'biconomy provider is null';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return {
      address: nftAddress as string,
      id: tokenId ? tokenId.toNumber().toString() : undefined,
      uri: cid,
    };
  };

  /**
   * Function to mint a new NFT.
   * It takes the NFT metadata as an argument and mints the new NFT using account abstraction for fees payment.
   *
   * @async
   * @function
   * @param {NFT} nft - The NFT metadata.
   * @returns {Promise<MintNFTResponse>} The response containing the NFT address, ID, and URI.
   */
  const mintNFT = async (nft: NFT): Promise<MintNFTResponse> => {
    // ------------------------STEP 1: Initialise Biconomy Smart Account SDK--------------------------------//
    console.log(`useMintNFT: smartAccount: ${smartAccount}`);

    // // get EOA address from wallet provider
    // const signer = await connectToWallet();

    // ------------------------STEP 2: Build Partial User op from your user Transaction/s Request --------------------------------//

    // passing accountIndex is optional, by default it will be 0
    // it should match with the index used to initialise the SDK Biconomy Smart Account instance
    const biconomySmartAccount = smartAccount;
    console.log(`useMintNFT: biconomySmartAccount: ${biconomySmartAccount}`);

    if (!biconomySmartAccount || !provider)
      return {
        address: '',
        id: '',
        uri: '',
      };

    const smartAccountAddress =
      await biconomySmartAccount.getSmartAccountAddress(config.accountIndex);

    let nftMetaData = { ...nft };

    delete nftMetaData.supply;
    console.log('useMintNFT: nftMetaData = ', nftMetaData);

    const metaDataFileObject = new File(
      [
        new Blob([JSON.stringify(nftMetaData)], {
          lastModified: Date.now(),
          type: 'text/plain',
        } as ExtendedBlobPropertyBag),
      ],
      'ERC721Metadata.json',
    );
    const cid = await uploadFile(metaDataFileObject);
    console.log('useMintNFT: cid = ', cid);

    // Here we are minting NFT to smart account address itself
    const nftAddress = process.env.NEXT_PUBLIC_TIPERC721_ADDRESS;

    // generate mintNft data
    const nftInterface = new Interface([
      'function safeMint(address _to,string uri)',
    ]);

    const transaction = createTransaction()
      .to(nftAddress as string)
      .data(
        nftInterface.encodeFunctionData('safeMint', [smartAccountAddress, cid]),
      );

    console.log(`useMintNFT: transaction: ${transaction}`);

    // build partial userOp
    let partialUserOp = await smartAccount.buildUserOp([
      transaction as Transaction,
    ]);

    console.log(
      `useMintNFT: partialUserOp: ${JSON.stringify(partialUserOp, null, '\t')}`,
    );

    // Below function gets the signature from the user (signer provided in Biconomy Smart Account)
    // and also send the full op to attached bundler instance
    try {
      const userOpResponse = await handleBiconomyPayment(partialUserOp);

      console.log(`useMintNFT:userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait(1);

      console.log(
        `useMintNFT: transactionDetails: ${JSON.stringify(
          transactionDetails,
          null,
          '\t',
        )}`,
      );

      const receipt = transactionDetails.receipt;

      console.log('useMintNFT: receipt = ', receipt);

      const iface = new Interface(TipERC721.abi);
      const parsedLogs = receipt.logs.map((log) => {
        try {
          return iface.parseLog(log);
        } catch (e) {
          return null;
        }
      });

      // Filter out null values and find the Transfer event
      const transferLog = parsedLogs.find(
        (log) => log && log.name === 'Transfer',
      );

      if (transferLog) {
        console.log(
          'useMintNFT: Token ID:',
          transferLog.args.tokenId.toString(),
        );
      } else {
        console.log('useMintNFT:Transfer event not found');
      }

      const tokenId = transferLog?.args.tokenId;

      return {
        address: nftAddress as string,
        id: tokenId ? tokenId.toNumber().toString() : undefined,
        uri: cid,
      };
    } catch (e) {
      const errorMessage = 'useMintNFT: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(errorMessage, e);
    }
  };

  const erc721InterfaceId = 0x80ac58cd;

  /**
   * Function to check if an NFT contract is ERC721 compliant.
   * It takes the NFT contract address as an argument and returns a boolean indicating if it is ERC721 compliant.
   *
   * @async
   * @function
   * @param {string} nftAddress - The address of the NFT contract.
   * @returns {Promise<boolean>} A boolean indicating if the NFT contract is ERC721 compliant.
   */
  const getIsERC721 = async (nftAddress: string): Promise<boolean> => {
    if (!nftAddress) return false;

    console.log('useMintNFT: getIsERC721: nftAddress = ', nftAddress);
    const iERC165 = new Contract(nftAddress, IERC165.abi, provider);

    console.log('before isERC721 result');
    const result = (await iERC165.supportsInterface(
      erc721InterfaceId,
    )) as boolean;
    console.log('isERC721 result = ', result);

    return result;
  };

  return {
    mintNFT,
    mintNFTSponsored,
    getIsERC721,
  };
}
