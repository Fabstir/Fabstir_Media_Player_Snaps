/**
 * This module defines a React component that represents the right section of a slide-over panel for creating a new NFT (Non-Fungible Token).
 * It uses Tailwind CSS for styling and relies on several hooks and components from other modules.
 *
 * @module NFTSlideOverRight
 */
import { Popover, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import DropFile from './DropFile';
import DropImage from './DropImage';
import DropVideoS5 from './DropVideoS5';

/**
 * The NFTSlideOverRight component represents the right section of a slide-over panel for creating a new NFT.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.encKey - The encryption key used for securing video files.
 *
 * @returns {JSX.Element} The JSX representation of the component.
 */
const NFTSlideOverRight = ({ encKey }) => {
  const {
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchType = watch('type');

  const [videoGenresSet, setVideoGenresSet] = useState(
    new Set(getValues('genres')),
  );

  useEffect(() => {
    return () => {};
  }, []);

  const musicGenres = {
    Acapella: 1,
    African: 3,
    'Alt country': 4,
    'Alt Rock': 5,
    Ambient: 6,
    Bluegrass: 7,
    Blues: 8,
    "Children's": 9,
    Classical: 10,
    Country: 12,
    Dance: 13,
    Disco: 14,
    Dubstep: 15,
    'Easy listening': 16,
    Electro: 17,
    'Electronic dance': 18,
    Electronic: 19,
    Folk: 20,
    Funk: 21,
    Grunge: 22,
    'Hardcore punk': 23,
    'Heavy metal': 24,
    'Hip hop': 25,
    House: 26,
    'Indie rock': 27,
    Industrial: 28,
    Instrumental: 29,
    Jazz: 30,
    'J-pop': 31,
    'K-pop': 32,
    Latin: 33,
    Musical: 34,
    'New-age': 36,
    Opera: 37,
    Pop: 38,
    'Pop rock': 39,
    'Progressive rock': 40,
    'Psychedelic rock': 41,
    'Punk rock': 42,
    Reggae: 43,
    Rock: 44,
    'Rythum & blues': 45,
    Soul: 46,
    'Synth pop': 47,
    Techno: 48,
    Trance: 49,
    World: 50,
  };

  const genres = {
    Action: 28,
    Adventure: 12,
    Animation: 16,
    Comedy: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    History: 36,
    Horror: 27,
    Kids: 10762,
    Music: 10402,
    Mystery: 9648,
    News: 10763,
    Reality: 10764,
    Romance: 10749,
    'Sci-Fi': 878,
    Short: 10801,
    Soap: 10766,
    Talk: 10767,
    'TV Movie': 10770,
    'War & Politics': 10768,
    Thriller: 53,
    War: 10752,
    Western: 37,
  };

  /**
   * A handler function to manage the selection of film genres.
   *
   * @param {number} genreId - The ID of the selected genre.
   */
  const handle_FilmGenres = (genreId) => {
    const theGenres = new Set(videoGenresSet);

    if (theGenres.has(genreId)) theGenres.delete(genreId);
    else theGenres.add(genreId);

    setVideoGenresSet(theGenres);
    setValue('genres', [...theGenres]);
  };

  return (
    <section
      aria-labelledby="summary-heading"
      className="bg-fabstir-dark-purple px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
    >
      <div className="mx-auto max-w-lg lg:max-w-none">
        <h2
          id="summary-heading"
          className="text-lg font-medium text-fabstir-white"
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
                  field="backDropImage"
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

            <DropFile
              field="fileUrls"
              fieldName="fileNames"
              twStyle="w-1/2 aspect-[3/2]"
              text="<file>"
              maxNumberOfFiles={10}
            />

            <DropVideoS5
              field="video"
              twStyle="w-2/3 aspect-[16/9]"
              text="<video>"
              encKey={encKey}
            />

            <h2 className="mt-6 text-center text-3xl font-extrabold text-fabstir-light-gray">
              Genres
            </h2>
            <div className="mt-3 flex grid grid-cols-5 justify-center">
              {Object.entries(genres).map(([genre, genreId]) => (
                <li
                  className="form-check form-check-inline col-span-1 flex flex-1"
                  key={genreId}
                >
                  <div>
                    <input
                      className="form-check-input float-left mr-2 mt-1 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-fabstir-dark-gray bg-contain bg-center bg-no-repeat align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                      type="checkbox"
                      id="inlineCheckbox1"
                      checked={videoGenresSet?.has(genreId)}
                      value={genreId}
                      onChange={() => handle_FilmGenres(genreId)}
                    />
                    <label
                      className="form-check-label inline-block text-sm text-fabstir-light-gray"
                      for="inlineCheckbox1"
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
          <Transition.Root as={Fragment}>
            <div>
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              ></Transition.Child>
            </div>
          </Transition.Root>
        </Popover>
      </div>
    </section>
  );
};

export default NFTSlideOverRight;
