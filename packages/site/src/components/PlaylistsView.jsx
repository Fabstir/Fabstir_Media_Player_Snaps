import React, { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import NFTView from './NFTView';
import { getNFTAddressId } from '../utils/nftUtils';
import { userpubstate } from '../atoms/userAtom';
import { userauthpubstate } from '../atoms/userAuthAtom';
import NFTListView from './NFTListView';
import useMintNFT from '../blockchain/useMintNFT';
import { get } from 'lodash';

export default function PlaylistsView({
  nfts,
  userAccountAddress,
  setNFTs,
  twStyle,
  twTitleStyle,
  twTextStyle,
  handleSubmit_RemovePlaylistFromPlaylists,
  handle_UpNFTs,
  handle_DownNFTs,
  disableNavigation,
  scale,
  isBlog = false,
  isListView = false,
  playlistCurrentIndex,
}) {
  console.log('PlaylistsView: nfts = ', nfts);
  const setCurrentNFT = useSetRecoilState(currentnftmetadata);

  const userPub = useRecoilValue(userpubstate);
  const userAuthPub = useRecoilValue(userauthpubstate);

  const [publicStates, setPublicStates] = useState({});
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const { getIsOwnNFT } = useMintNFT();

  const setIsPublicForPlaylist = (id, value) => {
    // Update the publicStates object
    setPublicStates((prevState) => ({ ...prevState, [id]: value }));

    // Find the nft with the given id and update its isPublicForPlaylist property
    const nftIndex = nfts.findIndex((nft) => nft.id === id);
    if (nftIndex !== -1) {
      const updatedNfts = [...nfts];
      updatedNfts[nftIndex] = {
        ...updatedNfts[nftIndex],
        isPublicForPlaylist: value,
      };
      setNFTs(updatedNfts);
    }
  };

  useEffect(() => {
    const initialPublicStates = nfts.reduce((acc, nft) => {
      acc[nft.id] = nft.isPublicForPlaylist;
      return acc;
    }, {});

    setPublicStates(initialPublicStates);
  }, [nfts]);

  useEffect(() => {
    (async () => {
      if (nfts && userAccountAddress) {
        const ownedNFTs = nfts.filter((nft) =>
          getIsOwnNFT(userAccountAddress, nft),
        );
        setOwnedNFTs(ownedNFTs);
      }
    })();
  }, [nfts, userAccountAddress]);

  return (
    <div className={twStyle}>
      {isListView ? (
        <>
          {ownedNFTs?.map((nft, index) => (
            <NFTListView
              key={index}
              nft={nft}
              to={
                disableNavigation
                  ? ''
                  : `/users/${nft.userPub}/${getNFTAddressId(nft)}`
              }
              twTitleStyle={twTitleStyle}
              twTextStyle={twTextStyle}
              handleSubmit_RemoveNFT={handleSubmit_RemovePlaylistFromPlaylists}
              disableNavigation={disableNavigation}
              setCurrentNFT={setCurrentNFT}
              handle_UpNFTs={
                !isBlog || (isBlog && nft.isBlog) ? handle_UpNFTs : undefined
              }
              handle_DownNFTs={handle_DownNFTs}
              isPublic={publicStates[nft.id]}
              setIsPublic={
                setNFTs
                  ? (value) => setIsPublicForPlaylist(nft.id, value)
                  : null
              }
              reseller={userPub !== userAuthPub ? userAccountAddress : null}
            />
          ))}
        </>
      ) : (
        <>
          {ownedNFTs
            ?.filter((nft) => nft)
            .map((nft, index) => (
              <div
                key={index}
                className={`${index === playlistCurrentIndex ? 'border-2 border-secondary' : ''}`}
              >
                <NFTView
                  nft={nft}
                  to={
                    disableNavigation
                      ? ''
                      : `/users/${nft.userPub}/${getNFTAddressId(nft)}`
                  }
                  twTitleStyle={twTitleStyle}
                  twTextStyle={twTextStyle}
                  handleSubmit_RemoveNFT={
                    handleSubmit_RemovePlaylistFromPlaylists
                  }
                  disableNavigation={disableNavigation}
                  setCurrentNFT={setCurrentNFT}
                  scale={scale}
                  handle_UpNFTs={
                    !isBlog || (isBlog && nft.isBlog)
                      ? handle_UpNFTs
                      : undefined
                  }
                  handle_DownNFTs={handle_DownNFTs}
                  isPublic={publicStates[nft.id]}
                  setIsPublic={
                    setNFTs
                      ? (value) => setIsPublicForPlaylist(nft.id, value)
                      : null
                  }
                  reseller={userPub !== userAuthPub ? userAccountAddress : null}
                />
              </div>
            ))}
        </>
      )}
    </div>
  );
}
