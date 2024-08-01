import { Dialog, Transition } from '@headlessui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { Fragment, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import * as yup from 'yup';

import useMintNFT from '../blockchain/useMintNFT';
import useCreateNFT from '../hooks/useCreateNFT';
import NFTSlideOverLeft from './NFTSlideOverLeft';
import NFTSlideOverRight from './NFTSlideOverRight';
import { currentnftmetadata } from '../atoms/nftSlideOverAtom';
import useUploadEncKey from '../hooks/useUploadEncKey';
import { getNFTAddressId } from '../utils/nftUtils';
import { userauthpubstate } from '../atoms/userAuthAtom';
import useNFTMedia from '../hooks/useNFTMedia';
import { teamsstate } from '../atoms/teamsAtom';

/**
 * Default values for the form fields.
 * @type {Object}
 */
let defaultFormValues = {
  name: '',
  address: '',
  symbol: '',
  supply: 1,
  summary: '',
  description: '',
  type: '',
  category: '',
  attributes: [],
  genres: [],
  musicGenres: [],
  image: '',
  lyricsUrl: '',
  animationSubtitlesUrl: [],
  animationAudioUrls: [],
  subtitlesUrl: [],
  audioUrls: [],
  multiToken: false,
  tokenise: false,
  deployed: false,
  isPublic: false,
  isNestable: false,
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
  const { putMetadata } = useNFTMedia();
  const [teams, setTeams] = useRecoilState(teamsstate);
  const resetTeams = useResetRecoilState(teamsstate);

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
    animation_url: yup.string().notRequired(),
    animationSubtitlesUrl: yup.array().notRequired(),
    animationAudioUrls: yup.array().notRequired(),
    lyricsUrl: yup.string().notRequired(),
    subtitlesUrl: yup.array().notRequired(),
    audioUrls: yup.array().notRequired(),
    isPublic: yup.boolean().required('Choice of public or private is required'),
    multiToken: yup.boolean().notRequired(),
    deployed: yup.boolean().notRequired(),
    isNestable: yup.boolean().notRequired(),
  });

  /**
   * The methods for the form, including validation.
   * @type {Object}
   */
  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(nftSchema),
  });

  const userAuthPub = useRecoilValue(userauthpubstate);

  const { mutate: createNFT, ...createNFTInfo } = useCreateNFT();
  const { mintNFT } = useMintNFT();

  const [currentNFT, setCurrentNFT] = useRecoilState(currentnftmetadata);

  const uploadEncKey = useUploadEncKey();
  const encKey = useRef('');

  const nft = useRef({});

  console.log('NFTSlideOver open = ', open);

  useEffect(() => {
    setSubmitText('Create NFT');
  }, [open, setSubmitText]);

  function getCidArrayToSubtitleTracks(cidArray) {
    const subtitleTracks = [];
    cidArray.forEach((cid) => {
      const filename = cid.split('<<')[1].split('>>')[0];
      const srclang = filename.substring(
        filename.lastIndexOf('_') + 1,
        filename.lastIndexOf('.'),
      );
      const label = srclang;

      subtitleTracks.push({
        kind: 'subtitles',
        cid,
        srclang,
        label,
      });
    });

    return subtitleTracks;
  }

  function getCidArrayToAudioTracks(cidArray) {
    const audioTracks = [];
    cidArray.forEach((cid) => {
      const filename = cid.split('<<')[1].split('>>')[0];
      const language = filename.substring(
        filename.lastIndexOf('_') + 1,
        filename.lastIndexOf('.'),
      );
      const label = language;

      audioTracks.push({
        kind: 'audio',
        cid,
        language,
        label,
        isTranscodePending: true,
      });
    });

    return audioTracks;
  }

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
      nft.current = {
        ...data,
        creator: userAuthPub,
        genres: data.genres ? [...data.genres] : [],
      };
    else if (data.type === 'audio') {
      nft.current = {
        ...data,
        creator: userAuthPub,
        genres: data.musicGenres ? [...data.musicGenres] : [],
      };

      if (nft.current.hasOwnProperty('musicGenres'))
        delete nft.current.musicGenres;
    } else nft.current = { ...data, creator: userAuthPub };

    delete nft.current.fileNames;

    const nftProps = Object.keys(nft.current);
    nftProps.forEach((prop) => {
      if (!nft.current[prop]) delete nft.current[prop];
    });

    try {
      const { address, id, uri } = await mintNFT(userAuthPub, nft.current);

      nft.current = {
        ...nft.current,
        userPub: userAuthPub,
        address,
        id,
        uri,
      };
    } catch (err) {
      alert(err.message);
      setSubmitText('Create NFT');
      return;
    }

    if (!data.isPublic && encKey?.current) {
      await uploadEncKey({
        nftAddressId: getNFTAddressId(nft.current),
        encKey: encKey?.current,
      });
    }

    // trailer/sample video
    let trailerTracksArray = [];
    if (data.animation_url && data.animationSubtitlesUrl?.length > 0) {
      trailerTracksArray = getCidArrayToSubtitleTracks(
        data.animationSubtitlesUrl,
      );
    } else delete nft.current.animationSubtitlesUrl;

    if (data.video && data.animationAudioUrls?.length > 0) {
      trailerTracksArray = [
        ...trailerTracksArray,
        ...getCidArrayToAudioTracks(data.animationAudioUrls),
      ];
    } else delete nft.current.animationAudioUrls;

    if (trailerTracksArray.length > 0) {
      await putMetadata(
        encKey?.current ? encKey?.current : null,
        data.video,
        trailerTracksArray,
      );
    }

    // main video
    let tracksArray = [];
    if (data.video && data.subtitlesUrl?.length > 0) {
      tracksArray = getCidArrayToSubtitleTracks(data.subtitlesUrl);
    } else delete nft.current.subtitlesUrl;

    if (data.video && data.audioUrls?.length > 0) {
      tracksArray = [
        ...tracksArray,
        ...getCidArrayToAudioTracks(data.audioUrls),
      ];
    } else delete nft.current.audioUrls;

    if (tracksArray.length > 0) {
      await putMetadata(
        encKey?.current ? encKey?.current : null,
        data.video,
        tracksArray,
      );
    }

    const nftMetadata = {
      ...nft.current,
      encKey: encKey.current,
      teams: [...(teams.teams || [])],
      teamsName: teams.teamsName,
    };
    createNFT(nftMetadata);

    if (encKey) encKey.current = '';

    methods.reset(initialValues);
    setOpen(false);
  }

  // useEffect to react to changes in createNFTInfo.isSuccess
  useEffect(() => {
    if (createNFTInfo.isSuccess) {
      setCurrentNFT(nft.current);
      console.log(
        'NFTSlideOver: createNFTInfo.isSuccess = ',
        createNFTInfo.isSuccess,
      );
    }
    // This effect should run whenever the isSuccess status changes
  }, [createNFTInfo.isSuccess]);

  useEffect(() => {
    if (createNFTInfo.isSuccess) {
      if (teams?.teams?.length > 0) {
        setCurrentNFT({
          ...nft.current,
          teamsName: teams.teamsName,
          teams: [...(teams.teams || [])],
        });
      } else setCurrentNFT(nft.current);

      resetTeams();
      setRerenderUserNFTs((prev) => prev + 1);
    }
  }, [createNFTInfo.isSuccess]);

  return (
    <FormProvider {...methods}>
      <Transition.Root show={open} as={Fragment}>
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="inset-0">
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
                <div
                  className="bg-fabstir-light-gray"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Background color split screen for large screens */}
                  <div
                    className="fixed left-0 top-0 hidden h-full w-1/2 bg-fabstir-light-gray lg:block"
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
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Transition.Root>
    </FormProvider>
  );
};

export default NFTSlideOver;
