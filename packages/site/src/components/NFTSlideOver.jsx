import { Dialog, Transition } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { Fragment, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as yup from 'yup';

import useMintNFT from '../blockchain/useMintNFT';
import useCreateNFT from '../hooks/useCreateNFT';
//import useUploadEncKey from '../hooks/useUploadEncKey';
import NFTSlideOverLeft from './NFTSlideOverLeft';
import NFTSlideOverRight from './NFTSlideOverRight';
import { currentnftmetadata } from '../atoms/nftMetaDataAtom';

/**
 * Default values for the form fields.
 * @type {Object}
 */
let defaultFormValues = {
  name: '',
  address: '',
  symbol: '',
  supply: 1,
  description: '',
  type: '',
  category: '',
  attributes: '',
  genres: [],
  musicGenres: [],
  image: '',
  multiToken: false,
  tokenise: false,
};

/**
 * Valid values for the 'type' field.
 * @type {string[]}
 */
const typeValues = ['audio', 'image', 'video', 'other'];

/**
 * Utility function to join class names.
 * @param {...string} classes - The class names to join.
 * @returns {string} - The joined class names.
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * A component to display a slide-over form for adding or editing NFTs.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the slide-over is open.
 * @param {Function} props.setOpen - Function to set the open state.
 * @param {Object} [props.initialValues=defaultFormValues] - The initial values for the form fields.
 * @param {string} props.submitText - The text to display on the submit button.
 * @param {Function} props.setSubmitText - Function to set the submit text.
 * @param {boolean} props.clearOnSubmit - Whether to clear the form on submit.
 * @param {Function} props.setRerenderUserNFTs - Function to trigger a re-render of the user's NFTs.
 * @returns {JSX.Element} - The rendered component.
 */
const NFTSlideOver = ({
  open,
  setOpen,
  initialValues = defaultFormValues,
  submitText,
  setSubmitText,
  clearOnSubmit,
  setRerenderUserNFTs,
}) => {
  const summaryMax = 250;
  const descriptionMax = 4000;
  const symbolMax = 10;
  const nameMax = 120;
  const categoryMax = 50;

  /**
   * The schema for form validation.
   * @type {yup.ObjectSchema}
   */
  const nftSchema = yup.object().shape({
    name: yup
      .string()
      .max(nameMax, `Name length is up to ${nameMax} characters`)
      .required('Name required'),
    symbol: yup
      .string()
      .max(symbolMax, `Symbol length is up to ${symbolMax} characters`)
      .required('Symbol required'),
    supply: yup
      .number()
      .min(1, 'Supply has to be one or more')
      .required('Supply required'),
    summary: yup
      .string()
      .max(summaryMax, `Summary length is up to ${summaryMax} characters`)
      .required('Summary required'),

    description: yup
      .string()
      .max(
        descriptionMax,
        `Description length is up to ${descriptionMax} characters`,
      )
      .required('Description required'),
    type: yup.string().oneOf(typeValues).required('Valid type required'),

    category: yup
      .string()
      .max(categoryMax, `Category length is up to ${summaryMax} characters`)
      .required('Category required'),

    image: yup.string().required('NFT image required'),
    video: yup
      .string()
      .notRequired()
      .when('type', {
        is: (type) => type === 'video',
        then: () => yup.string().required('Video is required'),
        otherwise: () => yup.string(),
      }),
    audio: yup
      .string()
      .notRequired()
      .when('type', {
        is: (type) => type === 'audio',
        then: () => yup.string().required('Audio is required'),
        otherwise: () => yup.string(),
      }),
    fileUrls: yup
      .array()
      .notRequired()
      .when('type', {
        is: (type) => type === 'other',
        then: () => yup.array().min(1, 'At least 1 file is required'),
        otherwise: () => yup.array(),
      }),
  });

  /**
   * The methods for the form, including validation.
   * @type {Object}
   */
  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(nftSchema),
  });

  const { mutate: createNFT, ...createNFTInfo } = useCreateNFT();
  const { mintNFT } = useMintNFT();

  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  const encKey = useRef('');
  //  const uploadEncKey = useUploadEncKey();

  const nft = useRef({});

  console.log('NFTSlideOver open = ', open);

  useEffect(() => {
    setSubmitText('Create NFT');
  }, [open, setSubmitText]);

  /**
   * The function to handle form submission.
   * It creates and mints a new NFT based on the form data.
   *
   * @param {Object} data - The form data.
   */
  async function handleSubmit_NFT(data) {
    console.log('NFTSlideOver: inside');

    setSubmitText('Creating...');

    if (data.type === 'video')
      nft.current = { ...data, genres: data.genres ? [...data.genres] : [] };
    else if (data.type === 'audio') {
      nft.current = {
        ...data,
        genres: data.musicGenres ? [...data.musicGenres] : [],
      };

      if (nft.current.hasOwnProperty('musicGenres'))
        delete nft.current.musicGenres;
    } else nft.current = { ...data };

    delete nft.current.fileNames;

    const nftProps = Object.keys(nft.current);
    nftProps.forEach((prop) => {
      if (!nft.current[prop]) delete nft.current[prop];
    });

    try {
      const { address, id, uri } = await mintNFT(nft.current);

      nft.current = {
        ...nft.current,
        creator: null,
        address,
        id,
        uri,
      };
    } catch (err) {
      alert(err.message);
      setSubmitText('Create NFT');
      return;
    }

    createNFT({ ...nft.current, encKey: encKey.current });

    methods.reset();
    setOpen(false);
  }

  useEffect(() => {
    setCurrentNFT(nft.current);
    if (createNFTInfo.isSuccess) setRerenderUserNFTs((prev) => prev + 1);
  }, [createNFTInfo.isSuccess]);

  const handleButtonClick = () => {
    setRerenderUserNFTs((prevValue) => prevValue + 1);
  };

  return (
    <FormProvider {...methods}>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50" onClose={setOpen}>
          <div className="inset-0">
            <Dialog.Overlay className="absolute inset-0" />

            <div className="fixed inset-y-0 right-0 flex max-w-full transform border-2 border-fabstir-gray">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="bg-fabstir-white">
                  {/* Background color split screen for large screens */}
                  <div
                    className="fixed left-0 top-0 hidden h-full w-1/2 bg-fabstir-white lg:block"
                    aria-hidden="true"
                  />
                  <div
                    className="fixed right-0 top-0 hidden h-full w-1/2 bg-fabstir-dark-purple lg:block"
                    aria-hidden="true"
                  />

                  <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 gap-x-16 overflow-y-auto lg:grid-cols-2 lg:px-8">
                    <h1 className="sr-only">NFT information</h1>

                    <NFTSlideOverRight encKey={encKey} />
                    <NFTSlideOverLeft
                      submitText={
                        submitText
                          ? submitText
                          : createNFTInfo.isLoading
                          ? 'Minting...'
                          : createNFTInfo.isError
                          ? 'Error!'
                          : createNFTInfo.isSuccess
                          ? 'Minted!'
                          : 'Create NFT'
                      }
                      nft={nft.current}
                      handleSubmit_NFT={handleSubmit_NFT}
                      summaryMax={summaryMax}
                      descriptionMax={descriptionMax}
                    />
                    <div>
                      <button onClick={handleButtonClick}>Increment</button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </FormProvider>
  );
};

export default NFTSlideOver;
