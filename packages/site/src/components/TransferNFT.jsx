import { Dialog, Transition } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { XIcon } from 'heroiconsv1/outline';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as yup from 'yup';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useMintNFT from '../blockchain/useMintNFT';
import { Input } from '../ui-components/input';
import useDeleteNFT from '../hooks/useDeleteNFT';
import { BigNumber } from '@ethersproject/bignumber';
import useMintNestableNFT from '../blockchain/useMintNestableNFT';
import useContractUtils from '../blockchain/useContractUtils';
import { Zero, One } from '@ethersproject/constants';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import BlockchainContext from '../../state/BlockchainContext';
import { useMintNestableERC1155NFT } from '../blockchain/useMintNestableERC1155NFT';
import { Button } from '../ui-components/button';

export default function TransferNFT({ nft, open, setOpen }) {
  const blockchainContext = useContext(BlockchainContext);
  const { connectedChainId } = blockchainContext;

  const userAuthPub = useRecoilValue(userauthpubstate);

  const [submitText, setSubmitText] = useState('Transfer');

  const { getNFTQuantity, transferNFT, getIsERC721 } = useMintNFT();
  const { mutate: deleteNFT, ...deleteNFTInfo } = useDeleteNFT(userAuthPub);
  const { getChainIdAddressFromChainIdAndAddress, newReadOnlyContract } =
    useContractUtils();
  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);
  const { getChildrenOfNestableNFT } = useMintNestableNFT();
  const { getChildrenOfNestableNFT: getChildrenOfNestableERC1155NFT } =
    useMintNestableERC1155NFT();

  // quantity: yup
  // .number()
  // .test('int', 'Must be int greater than zero.', (val) => {
  //   return ethers.BigNumber.from(val).gt(ethers.constants.Zero)
  // })

  yup.addMethod(yup.number, 'log', function () {
    return this.test({
      name: 'log',
      message: '${path} should be logged',
      test: function (value, { path }) {
        console.log(`TransferNFT: ${path} = ${value}`);
        return true;
      },
    });
  });

  yup.addMethod(yup.string, 'log', function () {
    return this.test({
      name: 'log',
      message: '${path} should be logged',
      test: function (value, { path }) {
        console.log(`TransferNFT: ${path} = ${value}`);
        return true;
      },
    });
  });

  const transferSchema = yup.object().shape({
    quantity: yup
      .number()
      .integer()
      .required('Must have an quantity greater than zero.')
      .positive()
      .log(),
    recipientAccountAddress: yup
      .string()
      .required('Recipient account address is required')
      .log(),
  });

  const defaultTransfer = {
    quantity: 1,
    recipientAccountAddress: '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultTransfer,
    resolver: yupResolver(transferSchema),
  });

  /**
   * Handles the submission for transferring an NFT (Non-Fungible Token). This function initiates the transfer process by updating the UI to indicate
   * the transfer is in progress, determining if the NFT is nestable or not, and calling the `transferNFT` function with the appropriate parameters.
   * If the NFT is nestable, it handles the transfer of child NFTs as well. After the transfer, it updates the UI based on the success or failure of the transfer.
   * In case of success, it also checks and updates the NFT's quantity and potentially removes the NFT from the local state if its quantity reaches zero.
   * The function provides feedback to the user throughout the process.
   *
   * @async
   * @function handleSubmit_TransferNFT
   * @param {Object} data - The form data containing the recipient's account address and the quantity of the NFT to transfer.
   */
  async function handleSubmit_TransferNFT(data) {
    setSubmitText('Transferring NFT...');

    (async () => {
      try {
        let theNFT = nft.isNestable
          ? {
              address: nft.parentAddress,
              id: nft.parentId,
              isNestable: true,
            }
          : nft;

        let retrieveChildrenOfNestableNFT;
        if (await getIsERC721(theNFT))
          retrieveChildrenOfNestableNFT = getChildrenOfNestableNFT;
        else retrieveChildrenOfNestableNFT = getChildrenOfNestableERC1155NFT;

        const children1 = await retrieveChildrenOfNestableNFT(theNFT.id);
        console.log('TransferNFT: children1 = ', children1);

        const isTransferred = await transferNFT(
          theNFT,
          data.recipientAccountAddress,
          data.quantity,
        );

        // Should check that there is enough balance to do transfer

        if (isTransferred) {
          const quantity = await getNFTQuantity(userAuthPub, nft);

          if (theNFT.isNestable) {
            // Assumes nestaable NFT is ERC-721 for now

            if (await getIsERC721(theNFT))
              retrieveChildrenOfNestableNFT = getChildrenOfNestableNFT;
            else
              retrieveChildrenOfNestableNFT = getChildrenOfNestableERC1155NFT;

            retrieveChildrenOfNestableNFT(theNFT.id).then(async (children) => {
              // Mark this function as async
              for (const child of children) {
                const nftAddress = getChainIdAddressFromChainIdAndAddress(
                  connectedChainId,
                  child.contractAddress,
                );

                const childNFT = {
                  address: nftAddress,
                  id: child.tokenId.toString(),
                };

                if (quantity.eq(Zero)) {
                  deleteNFT(childNFT); // stop gap until nestable NFT supports ERC-1155
                }
              }
            });
          }

          if (quantity.eq(Zero)) {
            deleteNFT(nft);
            setCurrentNFT(null);
          }

          setSubmitText('NFT Transferred!');
        } else throw new Error('NFT transfer failed');

        // if (setRerender) setRerender((prev) => prev + 1);
        setTimeout(() => {
          setOpen(false);
        }, 2000);
      } catch (err) {
        alert(err.message);
      }
    })();
  }

  useEffect(() => {}, []);

  function formatAddress(address) {
    // Check if the address is shorter than the desired format, return it as is
    if (address.length <= 10) {
      return address;
    }
    // Take the first part of the address and the last 4 characters, combine them with ellipsis
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={setOpen}
      >
        <div className="inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed bottom-0 left-1/2 flex max-w-full -translate-x-1/2 transform pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <div className="w-screen max-w-md">
                <div className="flex h-full flex-col border-2 border-fabstir-medium-light-gray bg-fabstir-light-gray shadow-xl">
                  <div className="px-4 py-2 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {/* {result?.media_type} */}
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <Button
                          variant="primary"
                          size="medium"
                          className="rounded-md"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-2 text-left">
                    <div>
                      <h3 className="text-lg font-medium leading-6 tracking-wider text-fabstir-light-gray">
                        {nft?.name}
                      </h3>
                      <p className="mt-4 text-sm text-gray-500">
                        This will transfer your NFT to the recipient's account.
                      </p>
                    </div>
                    <form
                      onSubmit={handleSubmit(handleSubmit_TransferNFT)}
                      className="mt-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6"
                    >
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="quantity"
                          className="block text-sm font-medium text-fabstir-dark-gray"
                        >
                          Quantity
                        </label>
                        <div className="mt-1">
                          <Input
                            id="quantity"
                            register={register('quantity')}
                            className="block w-full rounded-md border-gray-300 bg-fabstir-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                          {errors.quantity?.message}
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <label
                          htmlFor="recipientAccountAddress"
                          className="block text-sm font-medium text-fabstir-dark-gray"
                        >
                          Recipient's Account
                        </label>
                        <div className="mt-1">
                          <Input
                            id="recipientAccountAddress"
                            register={register('recipientAccountAddress')}
                            className="block w-full rounded-md border-gray-300 bg-fabstir-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />{' '}
                        </div>

                        <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                          {errors.recipientAccountAddress?.message}
                        </p>
                      </div>

                      <div className="justify-center sm:col-span-2 sm:col-start-3">
                        <Button
                          type="submit"
                          variant="primary"
                          size="medium"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium"
                        >
                          {submitText}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
