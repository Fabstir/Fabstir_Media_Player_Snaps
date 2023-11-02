import React, { useContext, useState, useEffect } from 'react';
import { MetamaskActions, MetaMaskContext } from '../src/hooks';
import Link from 'next/link';
import { fetchNFT } from '../src/hooks/useNFT';
import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth';
import { Web3Provider, Provider } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';
import { Transaction } from '@biconomy/core-types';

import { IBundler, Bundler } from '@biconomy/bundler';
import {
  BiconomySmartAccount,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';

import {
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
  PaymasterFeeQuote,
} from '@biconomy/paymaster';

import { connectSnap, getSnap, saveState, loadState } from '../src/utils';
import { useRecoilState } from 'recoil';
import { S5Client } from '../../../node_modules/s5client-js/dist/mjs/index';

import usePortal from '../src/hooks/usePortal';
import BlockchainContext from '../state/BlockchainContext';
import useTranscodeVideoS5 from '../src/hooks/useTranscodeVideoS5';
import {
  contractaddressescurrenciesstate,
  currenciesdecimalplaces,
  currencieslogourlstate,
  currencycontractaddressesstate,
} from '../src/atoms/currenciesAtom';
import { currentnftcategories } from '../src/atoms/nftSlideOverAtom';
import useMintNestableNFT from '../src/blockchain/useMintNestableNFT';
import useMintNFT from '../src/blockchain/useMintNFT';
import useParticleAuth from '../src/blockchain/useParticleAuth';

type NFTCollection = {
  [address: string]: object;
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const emptyStringArray = new Array<string>();

  const [addresses, setAddresses] = useState({}); // initialize with an empty array of type string[]
  const [newAddress, setNewAddress] = useState<string>('');
  const [removeAddress, setRemoveAddress] = useState<string>('');

  const { transcodeVideo } = useTranscodeVideoS5();
  const blockchainContext = useContext(BlockchainContext);

  const [currencyContractAddresses, setCurrencyContractAddresses] =
    useRecoilState(currencycontractaddressesstate);

  const [currenciesDecimalPlaces, setCurrenciesDecimalPlaces] = useRecoilState(
    currenciesdecimalplaces,
  );

  const [contractAddressesCurrencies, setContractAddressesCurrencies] =
    useRecoilState(contractaddressescurrenciesstate);

  const [currentNFTCategories, setCurrentNFTCategories] =
    useRecoilState(currentnftcategories);

  const [currenciesLogoUrl, setCurrenciesLogoUrl] = useRecoilState(
    currencieslogourlstate,
  );

  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null,
  );
  const [smartAccountProvider, setSmartAccountProvider] =
    useState<Provider | null>(null);

  const [userInfo, setUserInfo] = useState<any>(undefined);

  const [transak, setTransak] = useState<any>(undefined);

  const { socialLogin, fundYourSmartAccount } = useParticleAuth();

  useEffect(() => {
    // Update the context value
    if (blockchainContext) {
      blockchainContext.setSmartAccountProvider(smartAccountProvider);
      console.log(
        'useMintNFT: blockchainContext.biconomyProvider = ',
        smartAccountProvider,
      );
    }
  }, [smartAccountProvider]);

  useEffect(() => {
    // Update the context value
    blockchainContext.setSmartAccount(smartAccount);
    console.log('useMintNFT: blockchainContext.smartAccount = ', smartAccount);
  }, [smartAccount]);

  const { getIsNestableNFT } = useMintNestableNFT();
  const { getIsERC721 } = useMintNFT();

  console.log('index: Object.keys(process.env) =', Object.keys(process.env));

  const theCurrencies = ['USDC']; // Add other currencies as needed

  useEffect(() => {
    const usdcTokenAddress = process.env[`NEXT_PUBLIC_USDC_TOKEN_ADDRESS`];
    if (usdcTokenAddress) {
      setCurrencyContractAddresses({ USDC: usdcTokenAddress });
      setContractAddressesCurrencies({ [usdcTokenAddress as string]: 'USDC' });

      let theCurrenciesDecimalPlaces = {};
      theCurrencies.forEach((currency) => {
        if (currency === 'USDC')
          theCurrenciesDecimalPlaces = {
            ...theCurrenciesDecimalPlaces,
            [currency]: 6,
          };
        else
          theCurrenciesDecimalPlaces = {
            ...theCurrenciesDecimalPlaces,
            [currency]: 18,
          };
      });

      setCurrenciesDecimalPlaces(theCurrenciesDecimalPlaces);

      const theCurrentNFTCategories = [
        'artwork',
        'achievement',
        'certificate',
        'chat',
        'content',
        'financial',
        'identity',
        'in-game',
        'legal',
        'ownership',
        'other',
        'intellectual property',
        'real estate',
        'rights',
        'service',
        'ticket',
      ];
      setCurrentNFTCategories(theCurrentNFTCategories);

      setCurrenciesLogoUrl({
        USDC: 'assets/coins/usd-coin-usdc-logo.svg',
        MATIC: 'assets/coins/polygon-matic-logo.svg',
        STIR: 'assets/coins/fabstir_logo_official.png',
      });
    }
  }, []);

  useEffect(() => {
    console.log('Addresses updated:', addresses);
  }, [addresses]);

  /**
   * Handles adding a new address to the list of addresses.
   * If the NFT is a video, it ingests and transcodes it.
   */
  const handleAddAddress = async () => {
    // If video NFT then ingest and transcode

    console.log('index: handleAddAddress: enter');

    const customClientOptions = {};
    const client = new S5Client(
      process.env.NEXT_PUBLIC_PORTAL_URL,
      customClientOptions,
    );
    console.log('index: handleAddAddress: before downloadFile');
    const { downloadFile } = usePortal();
    console.log('index: handleAddAddress: after downloadFile');

    const { provider } = blockchainContext;

    const [addressId, encryptionKey] = newAddress.split(',');
    console.log('index: handleAddAddress: addressId = ', addressId);

    const [address, id] = addressId.split('_');

    if (!provider) throw new Error('index: handleAddAddress: provider is null');

    const isERC721 = await getIsERC721(address);
    if (!isERC721)
      throw new Error('index: handleAddAddress: address is not ERC721');

    let nftJSON = {};

    const isNestableNFT = await getIsNestableNFT(address);
    if (!isNestableNFT) {
      const nft = await fetchNFT(addressId, provider, downloadFile);
      console.log('index: nft = ', nft);

      if (nft?.video) {
        await transcodeVideo(nft, encryptionKey, true);
        nftJSON = { isTranscodePending: true };
      }
    }

    console.log('index: handleAddAddress: nftJSON = ', nftJSON);

    const newAddresses = { ...addresses, [addressId as string]: nftJSON };
    console.log('index: handleAddAddress: newAddresses = ', newAddresses);

    setAddresses(newAddresses);
    await saveState(newAddresses);

    setNewAddress('');
  };

  /**
   * Handles removing an address from the list of addresses.
   * Deletes the address from the saved state and updates the addresses state.
   */
  const handleRemoveAddress = async () => {
    console.log('handleRemoveAddress: removeAddress = ', removeAddress);

    const newAddresses = { ...addresses };
    delete newAddresses[removeAddress as keyof typeof newAddresses];
    await saveState(newAddresses);

    setAddresses(newAddresses);
    setRemoveAddress('');
  };

  /**
   * Handles loading the saved state of addresses.
   * Sets the addresses state to the saved state.
   */
  const handleLoadAddresses = async () => {
    const state: NFTCollection =
      (await loadState()) as unknown as NFTCollection;

    console.log(
      'useCreateNFT: state.addresses.state = ',
      state.addresses.state,
    );
    setAddresses(state.addresses.state);
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (error) {
      dispatch({
        type: MetamaskActions.SetError,
        payload: error,
      });
    }
  };

  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: 'ed8d5743-25cc-4356-bcff-4babad01922d',
    clientKey: 'c7J1GXeesDyAYSgR68n445ZsglbTluMaiWofalmi',
    appId: '6a89f6d0-f864-4d79-9afd-f92187f77fce',
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });

  const bundler: IBundler = new Bundler({
    bundlerUrl:
      'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
    chainId: 80001,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl:
      'https://paymaster.biconomy.io/api/v1/80001/FmcNOqB2j.1512a154-33be-4e05-8e0a-598dfa6fbef9',
  });

  const connect = async () => {
    try {
      const { biconomySmartAccount, web3Provider, userInfo } =
        await socialLogin();

      setSmartAccountAddress(
        await biconomySmartAccount.getSmartAccountAddress(),
      );
      setSmartAccount(biconomySmartAccount);
      setSmartAccountProvider(web3Provider);

      setUserInfo(userInfo);
      setLoading(false);
    } catch (e) {
      const errorMessage = 'useMintNFT: connect: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(errorMessage, e);
    }
  };

  const handleFundYourSmartAccount = async () => {
    try {
      if (!smartAccount)
        throw new Error(
          'useMintNFT: handleFundYourSmartAccount: smartAccount is null',
        );

      const transak = await fundYourSmartAccount(userInfo, smartAccount);
      setTransak(transak);
    } catch (error) {
      throw new Error(
        'useMintNFT: handleFundYourSmartAccount: error received ',
        error,
      );
    }
  };

  interface ExtendedBlobPropertyBag extends BlobPropertyBag {
    lastModified?: number;
  }

  interface MintNFTResponse {
    address: string;
    id: string;
  }

  const mintNFTorig = async (): Promise<MintNFTResponse> => {
    const { provider } = blockchainContext;

    //    const nftAddress = process.env.NEXT_PUBLIC_TIPERC721_ADDRESS;
    const nftAddress = '0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e'; // Todo // use from config

    let tokenId: any;
    if (smartAccountProvider) {
      if (smartAccount) {
        const address = await smartAccount.getSmartAccountAddress();
        console.log('useMintNFT: mintNFT: address = ', address);

        // const nftInterface = new Interface([
        //   'function safeMint(address _to,string uri)',
        // ]);
        const nftInterface = new Interface(['function safeMint(address _to)']);

        // const data = nftInterface.encodeFunctionData('safeMint', [
        //   address,
        //   cid,
        // ]);
        const data = nftInterface.encodeFunctionData('safeMint', [address]);

        const transaction = {
          to: nftAddress,
          data: data,
        };

        console.log('useMintNFT: mintNFT: creating nft mint userop');
        let partialUserOp = await smartAccount.buildUserOp([
          transaction as Transaction,
        ]);

        console.log('useMintNFT: mintNFT: partialUserOp= ', partialUserOp);
        let finalUserOp = partialUserOp;

        const biconomyPaymaster =
          smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

        console.log(
          'useMintNFT: mintNFT: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS = ',
          process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS,
        );

        const feeQuotesResponse =
          await biconomyPaymaster.getPaymasterFeeQuotesOrData(partialUserOp, {
            mode: PaymasterMode.ERC20,
            tokenList: [process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS as string],
          });

        const feeQuotes = feeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
        const spender = feeQuotesResponse.tokenPaymasterAddress || '';
        const usdcFeeQuotes = feeQuotes[0];

        console.log('useMintNFT: mintNFT: spender= ', spender);
        console.log('useMintNFT: mintNFT: usdcFeeQuotes= ', usdcFeeQuotes);

        finalUserOp = await smartAccount.buildTokenPaymasterUserOp(
          partialUserOp,
          {
            feeQuote: usdcFeeQuotes,
            spender: spender,
            maxApproval: false,
          },
        );

        console.log(
          'useMintNFT: mintNFT: usdcFeeQuotes.tokenAddress = ',
          usdcFeeQuotes.tokenAddress,
        );

        let paymasterServiceData = {
          mode: PaymasterMode.ERC20,
          feeTokenAddress: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS,
        };

        console.log('useMintNFT: mintNFT: finalUserOp= ', finalUserOp);

        try {
          const paymasterAndDataWithLimits =
            await biconomyPaymaster.getPaymasterAndData(
              finalUserOp,
              paymasterServiceData,
            );

          console.log(
            'useMintNFT: mintNFT: paymasterAndDataWithLimits = ',
            paymasterAndDataWithLimits,
          );

          finalUserOp.paymasterAndData =
            paymasterAndDataWithLimits.paymasterAndData;

          console.log(
            'useMintNFT: mintNFT: finalUserOp.paymasterAndData = ',
            finalUserOp.paymasterAndData,
          );
        } catch (e) {
          const errorMessage = 'useMintNFT: mintNFT: error received';
          console.error(`${errorMessage} ${e.message}`);
          throw new Error(errorMessage, e);
        }

        try {
          console.log(
            'useMintNFT: mintNFT: before const userOpResponse = await smartAccount.sendUserOp(finalUserOp);',
          );
          const userOpResponse = await smartAccount.sendUserOp(finalUserOp);
          console.log('useMintNFT: mintNFT: userOpResponse = ', userOpResponse);

          const transactionDetails = await userOpResponse.wait();
          console.log(
            'useMintNFT: mintNFT: transactionDetails = ',
            transactionDetails,
          );

          console.log(
            `useMintNFT: mintNFT: transactionDetails: https://mumbai.polygonscan.com/tx/${transactionDetails.logs[0].transactionHash}`,
          );
          console.log(
            `useMintNFT: mintNFT: view minted nfts for smart account: https://testnets.opensea.io/${address}`,
          );
        } catch (e) {
          const errorMessage = 'useMintNFT: mintNFT: error received';
          console.error(`${errorMessage} ${e.message}`);
          throw new Error(errorMessage, e);
        }
      } else {
        const errorMessage = 'useMintNFT: mintNFT: smartAccount is null';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    } else {
      const errorMessage = 'useMintNFT: mintNFT: biconomy provider is null';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return {
      address: nftAddress as string,
      id: tokenId ? tokenId.toNumber().toString() : undefined,
    };
  };

  return (
    <div className="p-4">
      <button onClick={handleConnectClick}>Connect Snap</button>
      <br />
      <h1>Based Account Abstraction</h1>
      <h2>Connect and Mint your AA powered NFT now</h2>
      {!loading && !smartAccountAddress && (
        <button onClick={connect} className="">
          Connect to Based Web3
        </button>
      )}
      {smartAccountAddress && (
        <button onClick={handleFundYourSmartAccount} className="">
          Fund your Smart Account
        </button>
      )}
      <br />
      {/* <button onClick={mintNFT} className="">
        Mint NFT
      </button> */}
      {loading && <p>Loading Smart Account...</p>}
      {smartAccountAddress && <h2>Smart Account: {smartAccountAddress}</h2>}
      <br />
      <Link href="/gallery/userNFTs">
        <button className="bg-blue-100 mt-4 p-1 text-xl">Gallery</button>
      </Link>
      <h1 className="mt-4">List of Addresses</h1>{' '}
      {/* Replaced Heading with h1 */}
      <div>
        {' '}
        {/* Replaced Text with p */}
        <ul>
          {' '}
          {/* Replaced UnorderedList with ul */}
          {Object.keys(addresses).map((address) => (
            <li key={address}>{address}</li>
          ))}
        </ul>
      </div>
      <input
        className="mt-6"
        value={newAddress}
        onChange={(e) => setNewAddress(e.target.value)}
        placeholder="Enter address"
      />
      <button className="bg-blue-100 p-1" onClick={handleAddAddress}>
        Add Address
      </button>
      <br />
      <input
        className="mt-4"
        value={removeAddress}
        onChange={(e) => setRemoveAddress(e.target.value)}
        placeholder="Enter address to remove"
      />
      <button className="bg-blue-100 p-1" onClick={handleRemoveAddress}>
        Remove Address
      </button>
      <br />
      <button
        className="bg-blue-100 text-xl mt-4"
        onClick={handleLoadAddresses}
      >
        <p className=" text-xl p-1">Load Addresses</p>
      </button>
    </div>
  );
};

export default Index;