import React, { useContext, useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

import { Button } from '../src/ui-components/button';
import { Description, Label } from '../src/ui-components/fieldset';
import { Textarea } from '../src/ui-components/textarea';
import { Field as HeadlessField } from '@headlessui/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/ui-components/table';

import { MetamaskActions, MetaMaskContext } from '../src/hooks';
import Link from 'next/link';
import { fetchNFT } from '../src/hooks/useNFT';
import { ParticleAuthModule, ParticleProvider } from '@biconomy/particle-auth';
import { Web3Provider, Provider } from '@ethersproject/providers';
import { Interface } from '@ethersproject/abi';
import { Transaction } from '@biconomy/core-types';

import { IBundler, Bundler } from '@biconomy/bundler';
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from '@biconomy/account';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';
import { ChainId } from '@biconomy/core-types';

import { v4 as uuidv4 } from 'uuid';

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
import {
  contractaddressescurrenciesstate,
  currenciesdecimalplaces,
  currencieslogourlstate,
  currencycontractaddressesstate,
} from '../src/atoms/currenciesAtom';
import { currentnftcategories } from '../src/atoms/nftSlideOverAtom';

import { getIsNestableNFTNonHook } from '../src/blockchain/useMintNestableNFT';
import { getIsERC721NonHook } from '../src/blockchain/useMintNFT';
import useParticleAuth from '../src/blockchain/useParticleAuth';
import useTranscodeVideoS5 from '../src/hooks/useTranscodeVideoS5';
import { saveAs } from 'file-saver';
import { iswasmreadystate } from '../src/atoms/renderStateAtom';
import { getSmartAccountAddress } from '../src/blockchain/useAccountAbstractionPayment';
import { createEOAAccount } from '../src/utils/eoaUtils';
import { getUser } from '../src/GlobalOrbit';
import { useQueryClient } from '@tanstack/react-query';

type Addresses = {
  [key: string]: any; // Replace `any` with the actual type of the values
};

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [triggerEffect, setTriggerEffect] = useState(0);

  const [addresses, setAddresses] = useState<Addresses>({}); // initialize with an empty array of type string[]
  const [newAddresses, setNewAddresses] = useState<string>('');
  const [removeAddresses, setRemoveAddresses] = useState<string>('');
  const [importKeys, setImportKeys] = useState<string>('');
  const [exportKeys, setExportKeys] = useState<string>('');

  const fileImportKeysRef = useRef<HTMLInputElement>(null);

  const [isWasmReady, setIsWasmReady] = useRecoilState(iswasmreadystate);

  const queryClient = useQueryClient();
  const user = getUser();

  //  const { getIsNestableNFT } = useMintNestableNFT();

  // Define a type for the hook's return value
  type UseTranscodeVideoS5Return = {
    transcodeVideo: (
      cid: string,
      isEncrypted: boolean,
      isGPU: boolean,
    ) => Promise<void>;
  };
  const { transcodeVideo } = useTranscodeVideoS5() as UseTranscodeVideoS5Return;

  const blockchainContext = useContext(BlockchainContext);
  const {
    smartAccountProvider,
    setSmartAccountProvider,
    smartAccount,
    setSmartAccount,
  } = blockchainContext;

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

  const [userInfo, setUserInfo] = useState<any>(undefined);

  const [transak, setTransak] = useState<any>(undefined);

  const { socialLogin, fundYourSmartAccount, logout } = useParticleAuth();
  const [userSession, setUserSession] = useState(null);

  const [errorsAddAddresses, setErrorsAddAddresses] = useState<string>('');
  const [errorsRemoveAddresses, setErrorsRemoveAddresses] =
    useState<string>('');
  const [errorsImportKeys, setErrorsImportKeys] = useState<string>('');
  const [errorsExportKeys, setErrorsExportKeys] = useState<string>('');

  useEffect(() => {
    // Update the context value
    if (blockchainContext) {
      blockchainContext.setSmartAccountProvider(smartAccountProvider);
      console.log(
        'index: blockchainContext.biconomyProvider = ',
        smartAccountProvider,
      );
    }
  }, [smartAccountProvider]);

  function searchEnvVar(name: string): string | null {
    for (const key in process.env) {
      if (key === name) {
        return process.env[key] || null;
      }
    }
    return null;
  }

  useEffect(() => {
    // Update the context value
    const setSmartAccountAddressFn = async () => {
      if (smartAccount)
        setSmartAccountAddress(await getSmartAccountAddress(smartAccount));
    };
    setSmartAccountAddressFn();
  }, [smartAccount]);

  //  const { getIsERC721 } = useMintNFT();

  console.log('index: Object.keys(process.env) =', Object.keys(process.env));

  const theCurrencies = ['DAI']; // Add other currencies as needed

  useEffect(() => {
    let theCurrenciesDecimalPlaces = {};

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
      USDC: 'assets/coins/usd-coin-stablecoin-logo.svg',
      DAI: 'assets/coins/multi-collateral-dai-dai-logo.svg',
      MATIC: 'assets/coins/polygon-matic-logo.svg',
      STIR: 'assets/coins/fabstir_logo_official.png',
    });

    for (const currency of theCurrencies) {
      const tokenAddress = searchEnvVar(
        `NEXT_PUBLIC_${currency}_TOKEN_ADDRESS`,
      );
      if (tokenAddress) {
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

        setCurrencyContractAddresses({ [currency]: tokenAddress });
        setContractAddressesCurrencies({ [tokenAddress as string]: currency });

        setCurrenciesDecimalPlaces(theCurrenciesDecimalPlaces);
      }
    }
  }, []);

  useEffect(() => {
    console.log('Addresses updated:', addresses);
  }, [addresses]);

  useEffect(() => {
    /**
     * Handles adding a new address to the list of addresses.
     * If the NFT is a video, it ingests and transcodes it.
     */
    const handleAddAddresses = async () => {
      const { provider } = blockchainContext;
      if (!provider || !smartAccount) {
        // Handle the case when provider or smartAccount is not available
        console.error('Provider or smartAccount is undefined');
        setErrorsAddAddresses('Not logged in.');
        return;
      }

      if (!newAddresses) return;

      console.log('index: handleAddAddress: enter');

      const customClientOptions = {};
      const client = new S5Client(
        process.env.NEXT_PUBLIC_PORTAL_URL,
        customClientOptions,
      );
      console.log('index: handleAddAddress: before downloadFile');

      // Define a type for the hook's return value
      const { downloadFile } = usePortal() as {
        downloadFile: (uri: string, customOptions: {}) => Promise<void>;
      };
      console.log('index: handleAddAddress: after downloadFile');

      const addressesList = newAddresses.split('\n');

      const updatedAddresses: Addresses = { ...addresses };

      for (const anAddress of addressesList) {
        const [addressId, encryptionKey] = anAddress.split(',');
        console.log('index: handleAddAddress: addressId = ', addressId);

        const [address, id] = addressId.split('_');

        if (!provider)
          throw new Error('index: handleAddAddress: provider is null');

        const isERC721 = await getIsERC721NonHook(address, provider);
        if (!isERC721)
          throw new Error('index: handleAddAddress: address is not ERC721');

        let nftJSON = {};

        const isNestableNFT = await getIsNestableNFTNonHook(address, provider);
        if (!isNestableNFT) {
          interface Nft {
            video?: any; // Replace `any` with the actual type of `video`
            // Define other properties of `nft` here
          }
          const nft: Nft | null = await fetchNFT(
            addressId,
            provider,
            downloadFile,
          );
          console.log('index: nft = ', nft);

          const isEncrypted =
            process.env.NEXT_PUBLIC_DEFAULT_IS_ENCRYPT === 'true';
          if (nft?.video) {
            await transcodeVideo(nft.video, isEncrypted, true);
            nftJSON = { isTranscodePending: true };
          }
        }

        console.log('index: handleAddAddress: nftJSON = ', nftJSON);

        updatedAddresses[addressId as string] = nftJSON;
        console.log(
          'index: handleAddAddress: updatedAddresses = ',
          updatedAddresses,
        );
      }

      setAddresses(updatedAddresses);
      await saveState(updatedAddresses);

      setNewAddresses('');
    };
    if (triggerEffect > 0) {
      // Or check if the flag is true, if using a boolean
      handleAddAddresses();
    }
  }, [triggerEffect]);

  /**
   * Handles removing an address from the list of addresses.
   * Deletes the address from the saved state and updates the addresses state.
   */
  const handleRemoveAddresses = async () => {
    if (!smartAccount) {
      // Handle the case when provider or smartAccount is not available
      console.error('Provider or smartAccount is undefined');
      setErrorsRemoveAddresses('Not logged in.');
      return;
    }

    if (!removeAddresses) return;

    console.log('handleRemoveAddress: removeAddress = ', removeAddresses);

    const newAddresses: Addresses = { ...addresses };

    const addressesList = removeAddresses.split('\n');

    for (const address of addressesList) {
      if (address in newAddresses) {
        delete newAddresses[address];
      }
    }

    setAddresses(newAddresses);
    await saveState(newAddresses);

    setRemoveAddresses('');
  };

  const handleButtonImportKeys = () => {
    if (!smartAccount) {
      // Handle the case when provider or smartAccount is not available
      console.error('Provider or smartAccount is undefined');
      setErrorsImportKeys('Not logged in.');
      return;
    }

    // Trigger the file input click event
    if (!fileImportKeysRef.current) return;

    fileImportKeysRef.current.click();
  };

  const handleImportKeys = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!smartAccount) {
      // Handle the case when provider or smartAccount is not available
      console.error('Provider or smartAccount is undefined');
      setErrorsImportKeys('Not logged in.');
      return;
    }

    if (!event.target.files?.length) return;

    if (!fileImportKeysRef.current || !event.target.files) return;

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = (e) => {
      const contents = e.target?.result as string;

      try {
        const newAddresses = JSON.parse(contents);

        const updatedAddresses = { ...addresses };

        for (const key in newAddresses) {
          if (!importKeys || importKeys.includes(key)) {
            updatedAddresses[key] = newAddresses[key];
          }
        }

        setAddresses(updatedAddresses);
        const handleSaveState = async () => {
          await saveState(updatedAddresses);
        };

        handleSaveState();
      } catch (error) {
        console.error('Error parsing JSON file:', error);
      }
    };

    reader.readAsText(file);
    setImportKeys('');
  };

  const handleExportKeys = () => {
    if (!smartAccount) {
      // Handle the case when provider or smartAccount is not available
      console.error('Provider or smartAccount is undefined');
      setErrorsExportKeys('Not logged in.');
      return;
    }

    let result: { [key: string]: any } = {}; // Declare result as an object with string keys and values of any type

    const exportKeysSplit = exportKeys.split('\n');
    for (let key of exportKeysSplit) {
      // Iterate over exportKeys
      if (key in addresses) {
        result[key] = addresses[key]; // If key is in addresses, add it to result
      }
    }

    const json = JSON.stringify(result); // Stringify result, not exportKeys
    const blob = new Blob([json], { type: 'application/json' });

    const uniqueString = uuidv4().replace(/-/g, ''); // Generate a unique string and remove dashes

    saveAs(blob, `mp_addresses_keys_${uniqueString}.json`);
    setExportKeys('');
  };

  /**
   * Handles loading the saved state of addresses.
   * Sets the addresses state to the saved state.
   */
  const handleLoadAddresses = async () => {
    type Addresses = {
      state?: any; // Replace `any` with the actual type of `state`
      // Define other properties of `state.addresses` here
    };

    const state: { addresses: Addresses } = (await loadState()) as unknown as {
      addresses: Addresses;
    };

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
    chainName: config.chainName,
    chainId: config.chainId,
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
      if (process.env.NEXT_PUBLIC_ENABLE_OTHER_WALLET !== 'true') {
        const { biconomySmartAccount, web3Provider, userInfo } =
          await socialLogin();

        if (!(biconomySmartAccount && web3Provider && userInfo))
          throw new Error('index: connect: login failed');

        const acc = await getSmartAccountAddress(biconomySmartAccount);
        console.log('index: connect: acc = ', acc);
        setSmartAccountAddress(acc);
        setSmartAccount(biconomySmartAccount);
        setSmartAccountProvider(web3Provider);

        setUserInfo(userInfo);
        setLoading(false);

        setErrorsAddAddresses('');
        setErrorsRemoveAddresses('');
        setErrorsImportKeys('');
        setErrorsExportKeys('');
      } else if (
        !(smartAccount && smartAccountProvider) &&
        setSmartAccount &&
        setSmartAccountProvider
      ) {
        if (process.env.NEXT_PUBLIC_DEFAULT_ALLOW_AA_SPONSORED === 'true') {
          const wallet = new ethers.Wallet(
            process.env.NEXT_PUBLIC_SPONSORED_ACCOUNT_PRIVATE_KEY as string,
          );
          const signer = wallet.connect(provider);
          setSmartAccount(signer);
          setSmartAccountProvider(signer);
          setUserInfo(null);
        } else {
          const result = await createEOAAccount();
          console.log('_app: result=', result);

          await loginFabstirDB('test3', 'mypassword3');

          setSmartAccount(result.smartAccount);
          setSmartAccountProvider(result.web3Provider);
          setUserInfo(null);
        }
      }
    } catch (e) {
      const errorMessage = 'index: connect: error received';
      console.error(`${errorMessage} ${e.message}`);
      throw new Error(errorMessage, e);
    }
  };

  async function handleLogout() {
    if (logout) await logout();
    setSmartAccount(null);
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="uppercase text-2xl font-bold mb-6">Web3 Media Player</h1>

      {!state.installedSnap && (
        <Button
          color="white"
          onClick={handleConnectClick}
          className="p-1 h-8 col-span-1 dark:bg-gray-200 bg-gray-200 mb-2"
        >
          Connect Snap
        </Button>
      )}
      <br />
      {!loading && !smartAccount && (
        <Button
          onClick={connect}
          color="white"
          className="mt-4 text-xl font-semibold dark:bg-gray-200 bg-gray-200"
        >
          Log in
        </Button>
      )}
      <br />
      {/* <button onClick={mintNFT} className="">
        Mint NFT
      </button> */}
      {loading && <p>Loading Smart Account...</p>}
      {smartAccount && (
        <h2 className="">Smart Account: {smartAccountAddress}</h2>
      )}
      {smartAccount && (
        <Button
          onClick={handleLogout}
          color="white"
          className="mt-2 mb-6 dark:bg-gray-200 bg-gray-200"
        >
          Log out
        </Button>
      )}
      <br />
      <Link href="/gallery/userNFTs">
        <Button
          color="white"
          className="p-1 text-2xl font-semibold dark:bg-gray-200 bg-gray-200 mt-4"
        >
          <p className="text-lg p-1 font-bold">Gallery</p>
        </Button>
      </Link>
      {/* <h1 className="mt-7 mb-4">List of Addresses</h1>{' '} */}

      <div className="mt-6 mb-10">
        <Button
          color="white"
          className="text-xl mt-4 dark:bg-gray-200 bg-gray-200"
          onClick={handleLoadAddresses}
        >
          Display Addresses
        </Button>

        {addresses && (
          <>
            {Object.keys(addresses)?.length > 0 && (
              <Table dense grid>
                <TableHead>
                  <TableRow>
                    <TableHeader>Address Id</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(addresses).map((address) => (
                    <TableRow key={address}>
                      <TableCell className="font-medium">{address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </div>
      {/* Replaced Heading with h1 */}
      <div className="grid grid-cols-12">
        <p className="col-span-12 text-gray-600 ml-4 mb-2">
          Enter address ids as contract address and token id separated by `_`
        </p>
        <HeadlessField className="grid grid-cols-12 gap-6 p-4 border-2 border-gray-200 col-span-11">
          <div className="col-span-5">
            <Label className="text-gray-800 dark:text-gray-800">
              Add Addresses
            </Label>
            <Description className="mt-1">
              Enter address ids to add to the gallery.
            </Description>
          </div>
          <div className="col-span-7">
            <Textarea
              name="addAddressses"
              className="bg-gray-200 rounded-md text-gray-800 dark:text-gray-800"
              value={newAddresses}
              onChange={(e) => setNewAddresses(e.target.value)}
              placeholder="Enter address ids"
            />
          </div>
        </HeadlessField>

        <Button
          color="white"
          className="p-1 h-8 m-4 col-span-1 text-gray-400 dark:text-gray-400 border-gray-300 dark:border-gray-300"
          onClick={() => setTriggerEffect((prev) => prev + 1)}
        >
          Add
        </Button>
        <p className=" text-red-600 pb-2">{errorsAddAddresses}</p>
        <HeadlessField className="grid grid-cols-12 gap-6 p-4 border-2 border-gray-200 col-span-11 col-start-1">
          <div className="col-span-5">
            <Label className="text-gray-800 dark:text-gray-800">
              Remove Addresses
            </Label>
            <Description className="mt-1">
              Enter address ids to remove from the gallery.
            </Description>
          </div>
          <div className="col-span-7">
            <Textarea
              name="removeAddresses"
              className="bg-gray-200 rounded-md text-gray-800 dark:text-gray-800"
              value={removeAddresses}
              onChange={(e) => setRemoveAddresses(e.target.value)}
              placeholder="Enter address ids"
            />
          </div>
        </HeadlessField>

        <Button
          color="white"
          className="p-1 h-8 m-4 col-span-1 text-gray-400 dark:text-gray-400 border-gray-300 dark:border-gray-300"
          onClick={handleRemoveAddresses}
        >
          Remove
        </Button>
        <p className=" text-red-600 pb-2">{errorsRemoveAddresses}</p>
        <HeadlessField className="grid grid-cols-12 gap-6 p-4 border-2 border-gray-200 col-span-11 col-start-1">
          <div className="col-span-5">
            <Label className="text-gray-800 dark:text-gray-800">
              Export Keys
            </Label>
            <Description className="mt-1">
              Enter address ids to export to a new keys file.
            </Description>
          </div>
          <div className="col-span-7">
            <Textarea
              name="exportKeys"
              className="bg-gray-200 rounded-md text-gray-800 dark:text-gray-800"
              value={exportKeys}
              onChange={(e) => setExportKeys(e.target.value)}
              placeholder="Enter address ids"
            />
          </div>
        </HeadlessField>

        <Button
          color="white"
          className="p-1 h-8 m-4 col-span-1 text-gray-400 dark:text-gray-400 border-gray-300 dark:border-gray-300"
          onClick={handleExportKeys}
        >
          Export
        </Button>
        <p className=" text-red-600 pb-2">{errorsExportKeys}</p>

        <HeadlessField className="grid grid-cols-12 gap-6 p-4 border-2 border-gray-200 col-span-11 col-start-1">
          <div className="col-span-5">
            <Label className="text-gray-800 dark:text-gray-800">
              Import Keys
            </Label>
            <Description className="mt-1">
              Browse to keys file to import. To import subset, enter address
              ids. Leave blank to import all keys.
            </Description>
          </div>
          <div className="col-span-7">
            <Textarea
              name="importKeys"
              className="bg-gray-200 rounded-md text-gray-800 dark:text-gray-800"
              value={importKeys}
              onChange={(e) => setImportKeys(e.target.value)}
              placeholder="Enter address ids"
            />
          </div>
        </HeadlessField>

        <input
          type="file"
          style={{ display: 'none' }}
          ref={fileImportKeysRef}
          onChange={handleImportKeys}
          accept=".json"
        />
        <Button
          color="white"
          className="p-1 h-8 m-4 col-span-1 text-gray-400 dark:text-gray-400 border-gray-300 dark:border-gray-300"
          onClick={handleButtonImportKeys}
        >
          Import
        </Button>
        <p className=" text-red-600 pb-2">{errorsImportKeys}</p>
      </div>
    </div>
  );
};

export default Index;
