import { Popover, Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import DropFile from './DropFile';
import DropImage from './DropImage';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const BadgeSlideOverRight = () => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext();

  const [genresSet, setGenresSet] = useState(new Set());
  const [musicGenresSet, setMusicGenresSet] = useState(new Set());

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

  const handle_FilmGenres = (genreId) => {
    if (genresSet.has(genreId)) genresSet.delete(genreId);
    else genresSet.add(genreId);

    const theGenres = new Set(genresSet);
    setGenresSet(theGenres);
    setValue('genres', theGenres);
  };

  const handle_MusicGenres = (genreId) => {
    if (musicGenresSet.has(genreId)) musicGenresSet.delete(genreId);
    else musicGenresSet.add(genreId);

    const theMusicGenres = new Set(genresSet);
    setMusicGenresSet(theMusicGenres);
    setValue('genres', theMusicGenres);
  };

  return (
    <section
      aria-labelledby="summary-heading"
      className="bg-fabstir-dark-purple px-4 pt-16 pb-10 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
    >
      <div className="mx-auto max-w-lg lg:max-w-none">
        <h2
          id="summary-heading"
          className="text-lg font-medium text-fabstir-light-gray"
        >
          Include image...
        </h2>
        <div>
          <DropImage
            field="image"
            twStyle="w-1/2 aspect-[1/1] rounded-xl"
            text="<Badge image (1:1)>"
          />

          <DropFile
            field="fileUrls"
            fieldName="fileNames"
            twStyle="w-2/3 aspect-[2/3]"
            text="<file>"
            maxNumberOfFiles={10}
          />
        </div>

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

export default BadgeSlideOverRight;
