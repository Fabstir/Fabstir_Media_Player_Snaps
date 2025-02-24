import { useRecoilValue, useSetRecoilState } from 'recoil';
import useCreateNFT from './useCreateNFT';
import useDeleteNFT from './useDeleteNFT';
import { userauthpubstate } from '../atoms/userAuthAtom';
import { useEffect } from 'react';
import { refetchnftscountstate } from '../atoms/renderStateAtom';

export default function useReplaceNFT() {
  const userAuthPub = useRecoilValue(userauthpubstate);

  const { mutate: createNFT, ...createNFTInfo } = useCreateNFT();
  const { mutate: deleteNFT, ...deleteNFTInfo } = useDeleteNFT(userAuthPub);
  const setRefetchNFTsCount = useSetRecoilState(refetchnftscountstate);

  useEffect(() => {
    if (createNFTInfo.isSuccess) {
      setRefetchNFTsCount((prev) => prev + 1);
      console.log(
        'NFTSlideOver: createNFTInfo.isSuccess = ',
        createNFTInfo.isSuccess,
      );
    }
    // This effect should run whenever the isSuccess status changes
  }, [createNFTInfo.isSuccess]);

  const upgradeNFTToParent = async (oldNFT, newNFT) => {
    console.log('useReplaceNFT: upgradeNFTToParent: oldNFT = ', oldNFT);

    const updatedNFT = {
      ...oldNFT,
      parentId: newNFT.id,
      parentAddress: newNFT.address,
    };

    await createNFT(updatedNFT);

    let updatedNewNFT = {
      ...newNFT,
      isNestable: true,
      userPub: oldNFT.userPub,
    };

    if (oldNFT.multiToken)
      updatedNewNFT = { ...updatedNewNFT, multiToken: oldNFT.multiToken };

    await createNFT(updatedNewNFT);

    // // Wait for deleteNFT to complete and check for success
    // if (deleteNFTInfo.isSuccess) {
    //   await createNFT(newNFT)

    //   // Wait for createNFT to complete and check for success
    //   if (createNFTInfo.isSuccess) {
    //     console.log('useReplaceNFT: newNFT = ', newNFT)
    //   } else {
    //     // Handle or throw an error if createNFT was not successful
    //     const createError = new Error('useReplaceNFT: Failed to create NFT')
    //     console.error(createError)
    //     throw createError
    //   }
    // } else {
    //   // Handle or throw an error if deleteNFT was not successful
    //   const deleteError = new Error('useReplaceNFT: Failed to delete NFT')
    //   console.error(deleteError)
    //   throw deleteError
    // }
  };

  const updateNFTToPointToParent = async (oldNFT, parentNFT) => {
    console.log('useReplaceNFT: updateNFTToPointToParent: oldNFT = ', oldNFT);
    console.log(
      'useReplaceNFT: updateNFTToPointToParent: parentNFT = ',
      parentNFT,
    );

    const updatedNFT = {
      ...oldNFT,
      parentId: parentNFT.id,
      parentAddress: parentNFT.address,
    };
    console.log(
      'useReplaceNFT: updateNFTToPointToParent: updatedNFT = ',
      updatedNFT,
    );

    await createNFT(updatedNFT);
  };

  const removeChildNFT = async (childNFT, parentNFT) => {
    if (!childNFT || !parentNFT || childNFT.parentId !== parentNFT.id)
      throw new Error('useReplaceNFT: childNFT.parentId !== parentNFT.id');

    console.log('useReplaceNFT: removeChildNFT: childNFT = ', childNFT);
    console.log('useReplaceNFT: removeChildNFT: parentNFT = ', parentNFT);

    //    await deleteNFT(childNFT)
    const updatedChild = { ...childNFT };
    updatedChild.parentId = null;
    updatedChild.parentAddress = null;

    await createNFT(updatedChild);

    console.log('useReplaceNFT: removeChildNFT: updatedChild = ', updatedChild);
  };

  const getIsNestableNFT = (nft) => {
    return nft.isNestable;
  };

  return {
    upgradeNFTToParent,
    removeChildNFT,
    updateNFTToPointToParent,
    getIsNestableNFT,
  };
}
