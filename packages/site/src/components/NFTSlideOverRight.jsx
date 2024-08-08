import {
  Popover,
  PopoverOverlay,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import DropAudio from './DropAudio';
import DropFile from './DropFile';
import DropImage from './DropImage';
import DropSingleFile from './DropSingleFile';
import DropVideo from './DropVideo';
import { Input } from '../ui-components/input';
import { Checkbox } from '../ui-components/checkbox';
import { videoGenres, musicGenres } from '../utils/mediaAttributes';
import { fetchMediaFormats } from '../utils/loadMediaFormats';
import DropMultipleAudio from './DropMultipleAudio';
import { useRouter } from 'next/router';

/**
 * Renders a slide-over component for NFT (Non-Fungible Token) creation or editing, providing different asset upload options based on the NFT type.
 * It supports uploading images, videos, audio files, and other file types. The component adapts its layout and available upload options
 * based on the selected NFT type (e.g., video, audio, image, other). It also handles genre selection for video and audio NFTs.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.encKey - Encryption key for encrypting uploaded files, if applicable.
 * @returns {React.ReactElement} The NFTSlideOverRight component.
 */
const NFTSlideOverRight = ({ encKey }) => {
  const {
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  console.log('NFTSlideOverRight: encKey = ', encKey);

  // const watchType = watch('type');

  const router = useRouter();
  const [watchType, setWatchType] = useState('');

  // This section fixes the issue where retrieving the watch value 'type' immediately after the component mounts returns undefined.
  // by adding a slight delay before the retrieval.
  /////////////////////

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'type') {
        setWatchType(value.type);
      }
    });

    // Delay the initial type value retrieval
    setTimeout(() => {
      setWatchType(getValues('type'));
    }, 0);

    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  useEffect(() => {
    // Handle route change to reset the type state
    const handleRouteChange = () => {
      // Delay the type value retrieval on route change
      setTimeout(() => {
        setWatchType(getValues('type'));
      }, 0);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, getValues]);
  /////////////////////

  const [videoGenresSet, setVideoGenresSet] = useState(
    new Set(getValues('genre')),
  );
  const [musicGenresSet, setMusicGenresSet] = useState(
    new Set(getValues('genre')),
  );

  const [animationUrlFormats, setAnimationUrlFormats] = useState([]);
  const [videoFormats, setVideoFormats] = useState([]);
  const [audioFormats, setAudioFormats] = useState([]);

  useEffect(() => {
    if (watchType !== 'video' && watchType !== 'audio') return;

    const animationUrlFormatsPath = 'settings/animationUrlFormats.json';

    const fetchFormats = async () => {
      const { animationUrlFormats, videoFormats, audioFormats } =
        await fetchMediaFormats();
      setAnimationUrlFormats(animationUrlFormats);
      setVideoFormats(videoFormats);
      setAudioFormats(audioFormats);
    };
    fetchFormats();
  }, [watchType]);

  useEffect(() => {
    return () => {};
  }, []);

  const handle_FilmGenres = (genre) => {
    const updatedGenres = new Set(videoGenresSet);
    if (updatedGenres.has(genre)) updatedGenres.delete(genre);
    else updatedGenres.add(genre);

    setVideoGenresSet(updatedGenres);
    setValue('genre', [...updatedGenres]);
  };

  const handle_MusicGenres = (genre) => {
    const updatedGenres = new Set(musicGenresSet);
    if (updatedGenres.has(genre)) updatedGenres.delete(genre);
    else updatedGenres.add(genre);

    setMusicGenresSet(updatedGenres);
    setValue('genre', [...updatedGenres]);
  };

  return (
    <section
      aria-labelledby="summary-heading"
      className="bg-fabstir-magenta-600 px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
    >
      <div className="mx-auto max-w-lg lg:max-w-none">
        <h2
          id="summary-heading"
          className="text-lg font-medium text-fabstir-light-gray"
        >
          Include assets...
        </h2>

        {watchType === 'video' && (
          <div>
            <DropImage
              field="image"
              twStyle="w-1/2 aspect-[1/1] rounded-xl"
              text="<NFT image (1:1)>"
            />
            <div className="grid grid-cols-3 gap-4 sm:gap-7">
              <div className="col-span-2">
                <DropImage
                  field="backdropImage"
                  twStyle="aspect-[16/9]"
                  text="<backdrop image (16:9)>"
                />
              </div>

              <div className="col-span-1">
                <DropImage
                  field="posterImage"
                  twStyle="aspect-[2/3]"
                  text="<poster image (2:3)>"
                  image="posterImage"
                />
              </div>
            </div>
            {animationUrlFormats?.length > 0 && (
              <div className="grid grid-cols-4 gap-4 sm:gap-7">
                <div className="col-span-2">
                  <DropVideo
                    field="animation_url"
                    twStyle="aspect-[3/2]"
                    text="<trailer/short video>"
                    encKey={null}
                    videoFormats={animationUrlFormats}
                    storageNetwork={
                      process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK
                    }
                  />
                </div>
                <div className="col-span-1">
                  <DropMultipleAudio
                    field="animationAudioUrls"
                    fieldName="audioFileNames"
                    twStyle="aspect-[3/2]"
                    text="<audio languages>"
                    encKey={null}
                    audioFormats={audioFormats}
                    storageNetwork={
                      process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK
                    }
                    maxNumberOfFiles={100}
                  />
                </div>
                <div className="col-span-1">
                  <DropFile
                    field="animationSubtitlesUrl"
                    fieldName="fileNames"
                    twStyle="w-2/3 aspect-[2/3]"
                    text="<subtitles(.vtt)>"
                    maxNumberOfFiles={100}
                  />
                </div>
              </div>
            )}
            {videoFormats?.length > 0 && (
              <div className="grid grid-cols-3 gap-4 sm:gap-7">
                {/* Ensure the parent div is a flex container */}
                <div className="col-span-2">
                  <DropVideo
                    field="video"
                    twStyle="aspect-[16/9]" // Ensure it grows to fill 2/3 of the space
                    text="<video>"
                    encKey={encKey}
                    videoFormats={videoFormats}
                  />
                </div>
                <div className="col-span-1 col-start-3">
                  {/* This div should take up the remaining 1/3 */}
                  <div className="flex flex-1 flex-col">
                    <DropMultipleAudio
                      field="audioUrls"
                      fieldName="audioFileNames"
                      twStyle="aspect-[16/9]" // Ensure it takes full width of its parent
                      text="<audio languages>"
                      encKey={null}
                      audioFormats={audioFormats}
                      storageNetwork={
                        process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK
                      }
                      maxNumberOfFiles={100}
                    />
                    <DropFile
                      field="subtitlesUrl"
                      fieldName="fileNames"
                      twStyle="w-2/3 aspect-[2/3]"
                      text="<subtitles(.vtt)>"
                      maxNumberOfFiles={100}
                    />
                  </div>
                </div>
              </div>
            )}
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-700">
              Genres
            </h2>
            <div className="mt-3 flex grid grid-cols-5 justify-center">
              {videoGenres.map((genre) => (
                <li
                  className="form-check form-check-inline col-span-1 flex flex-1"
                  key={genre}
                >
                  <div>
                    <Checkbox
                      className="form-check-input float-left mr-2 mt-1 h-4 w-4 cursor-pointer appearance-none rounded-sm border bg-contain bg-center bg-no-repeat align-top transition duration-200"
                      id="inlineCheckbox1"
                      checked={videoGenresSet?.has(genre)}
                      value={genre}
                      onChange={() => handle_FilmGenres(genre)}
                    />
                    <label
                      className="form-check-label inline-block text-sm text-fabstir-black"
                      htmlFor="inlineCheckbox1"
                    >
                      {genre}
                    </label>
                  </div>
                </li>
              ))}
            </div>
          </div>
        )}

        {watchType === 'audio' && (
          <div>
            <DropImage
              field="image"
              twStyle="w-1/2 aspect-[1/1] rounded-xl"
              text="<NFT image (1:1)>"
            />

            <DropImage
              field="backdropImage"
              twStyle="w-2/3 aspect-[16/9]"
              text="<backdrop image (16:9)>"
            />

            <DropSingleFile
              field="lyricsUrl"
              twStyle="w-1/2 aspect-[3/2]"
              text="<lyrics(.lrc)>"
            />

            {audioFormats?.length > 0 && (
              <div>
                <DropAudio
                  field="animation_url"
                  twStyle="w-1/2 aspect-[16/9]"
                  text="<sample/short audio>"
                  encKey={null}
                  audioFormats={audioFormats}
                  storageNetwork={
                    process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK
                  }
                />

                <DropAudio
                  field="audio"
                  twStyle="w-1/2 aspect-[16/9]"
                  text="<audio>"
                  encKey={encKey}
                  audioFormats={audioFormats}
                  storageNetwork={process.env.NEXT_PUBLIC_S5}
                />
              </div>
            )}

            <h2 className="mt-6 text-center text-3xl font-extrabold text-fabstir-dark-gray">
              Genres
            </h2>
            <div className="mt-3 flex grid grid-cols-4 justify-center">
              {musicGenres.map((genre) => (
                <li
                  className="form-check form-check-inline col-span-1 flex flex-1"
                  key={genre}
                >
                  <div>
                    <Checkbox
                      className="form-check-input float-left mr-2 mt-1 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-fabstir-dark-gray bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                      id="inlineCheckbox1"
                      checked={musicGenresSet?.has(genre)}
                      value={genre}
                      onChange={() => handle_MusicGenres(genre)}
                    />
                    <label
                      className="form-check-label inline-block text-sm text-fabstir-black"
                      htmlFor="inlineCheckbox1"
                    >
                      {genre}
                    </label>
                  </div>
                </li>
              ))}
            </div>
          </div>
        )}

        {watchType === 'image' && (
          <div>
            <DropImage
              field="image"
              twStyle="w-full aspect-[1/1] rounded-xl"
              text="<NFT image (1:1)>"
            />
          </div>
        )}

        {watchType === 'other' && (
          <div>
            <DropImage
              field="image"
              twStyle="w-1/2 aspect-[1/1] rounded-xl"
              text="<NFT image (1:1)>"
            />

            <DropFile
              field="fileUrls"
              fieldName="fileNames"
              twStyle="w-2/3 aspect-[2/3]"
              text="<file>"
              maxNumberOfFiles={10}
            />
          </div>
        )}

        <Popover className="fixed inset-x-0 bottom-0 flex flex-col-reverse text-sm font-medium text-fabstir-light-gray lg:hidden">
          <Transition as={Fragment}>
            <div>
              <TransitionChild
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <PopoverOverlay className="fixed inset-0 bg-black bg-opacity-25" />
              </TransitionChild>

              <TransitionChild
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              ></TransitionChild>
            </div>
          </Transition>
        </Popover>
      </div>
    </section>
  );
};

export default NFTSlideOverRight;
