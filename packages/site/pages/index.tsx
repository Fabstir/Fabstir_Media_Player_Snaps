import React, { useContext, useState, useEffect } from 'react';
import { MetamaskActions, MetaMaskContext } from '../src/hooks';
import Link from 'next/link';
import { fetchNFT } from '../src/hooks/useNFT';

import {
  connectSnap,
  getSnap,
  sendHello,
  saveState,
  loadState,
} from '../src/utils';
import { useRecoilState } from 'recoil';
import { S5Client } from '../../../node_modules/s5client-js/dist/mjs/index';

import usePortal from '../src/hooks/usePortal';
import BlockchainContext from '../state/BlockchainContext';
import useTranscodeVideoS5 from '../src/hooks/useTranscodeVideoS5';

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

  useEffect(() => {
    console.log('Addresses updated:', addresses);
  }, [addresses]);

  /**
   * Handles adding a new address to the list of addresses.
   * If the NFT is a video, it ingests and transcodes it.
   */
  const handleAddAddress = async () => {
    // If video NFT then ingest and transcode
    const customClientOptions = {};
    const client = new S5Client(
      process.env.NEXT_PUBLIC_PORTAL_URL,
      customClientOptions,
    );
    const { downloadFile } = usePortal();

    const { provider } = blockchainContext;

    const [address, encryptionKey] = newAddress.split(',');

    const nft = await fetchNFT(address, provider, downloadFile);
    console.log('index: nft = ', nft);

    let nftJSON = {};
    if (nft?.video) {
      await transcodeVideo(nft, encryptionKey, true);
      nftJSON = { isTranscodePending: true };
    }

    const newAddresses = { ...addresses, [address as string]: nftJSON };
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

  return (
    <div className="p-4">
      <button onClick={handleConnectClick}>Connect</button>
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
