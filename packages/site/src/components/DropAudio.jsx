/* This example requires Tailwind CSS v2.0+ */
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import useTranscodeAudioS5 from '../hooks/useTranscodeAudioS5';
import { useRecoilState } from 'recoil';
import usePortal from '../hooks/usePortal';
import { ffmpegprogressstate } from '../atoms/ffmpegAtom';
import {
  getKeyFromEncryptedCid,
  removeKeyFromEncryptedCid,
} from '../utils/s5EncryptCIDHelper';
import { Input } from '../ui-components/input';
import useNFTMedia from '../hooks/useNFTMedia';

const ProgressBar = ({ progressPercentage }) => {
  return (
    <div className="h-2 w-full bg-fabstir-blue">
      <div
        style={{ width: `${progressPercentage}%` }}
        className={`h-full ${
          progressPercentage < 70
            ? 'bg-fabstir-pink-500'
            : ' bg-fabstir-pink-400'
        }`}
      ></div>
    </div>
  );
};

const DropAudio = ({
  field,
  twStyle,
  text,
  encKey,
  storageNetwork = process.env.NEXT_PUBLIC_S5,
}) => {
  // console.log('slide-over:genres = ', result?.genre_ids);
  //  const [open, setOpen] = useState(true);
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchUrl = watch(field);

  const { uploadFile } = usePortal(storageNetwork);
  const { transcodeAudio } = useTranscodeAudioS5();

  const { putMetadata } = useNFTMedia();

  const [ffmpegProgress, setFFMPEGProgress] =
    useRecoilState(ffmpegprogressstate);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log('DropAudio: acceptedFiles = ', acceptedFiles);

    if (!acceptedFiles || acceptedFiles.length !== 1) {
      alert('Please upload single image only');
      return;
    }

    const isEncrypted = encKey ? true : false;

    const customOptions = { encrypt: isEncrypted };
    const file = acceptedFiles[0];
    const sourceCID = await uploadFile(file, customOptions);

    let key = '';
    if (
      storageNetwork === process.env.NEXT_PUBLIC_S5 &&
      customOptions.encrypt
    ) {
      console.log('DropAudio: sourceCID = ', sourceCID);

      key = getKeyFromEncryptedCid(sourceCID);
      encKey.current = key;

      const cidWithoutKey = removeKeyFromEncryptedCid(sourceCID);
      console.log('DropAudio: cidWithoutKey= ', cidWithoutKey);

      await putMetadata(key, cidWithoutKey, []);
      setValue(field, cidWithoutKey, true);
    } else {
      encKey.current = '';

      await putMetadata(null, sourceCID, []);
      setValue(field, sourceCID, false);

      console.log('DropAudio: sourceCID = ', sourceCID);
    }

    console.log('DropAudio: field = ', field);

    await transcodeAudio(sourceCID, isEncrypted);
    setFFMPEGProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="sm:col-span-3">
      <div className="sm:col-span-3">
        <div
          {...getRootProps()}
          className={`mt-8 flex flex-col ${twStyle} relative mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
        >
          {!watchUrl && !ffmpegProgress && (
            <div>
              <Input
                inputProps={getInputProps()}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-1 h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {text}
              {errors[field] && (
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
                  {errors[field].message}
                </p>
              )}

              {/* {transcodeAudioInfo?.isLoading && <p>Transcoding...</p>}
              {transcodeAudioInfo?.isError && <p>Transcode error</p>} */}
            </div>
          )}

          {ffmpegProgress > 0 &&
            ffmpegProgress < 1 &&
            !transcodeAudioInfo?.isSuccess && (
              <div
                className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm`}
              >
                <span className="">Transcoding, please wait...</span>
              </div>
            )}

          <div className="absolute bottom-0 w-full">
            <ProgressBar progressPercentage={ffmpegProgress * 100} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropAudio;
