/* This example requires Tailwind CSS v2.0+ */
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import useTranscodeAudioS5 from '../hooks/useTranscodeAudioS5';
import { useRecoilValue, useRecoilState } from 'recoil';
import usePortal from '../hooks/usePortal';
import {
  getBase64UrlEncryptedBlobHash,
  getKeyFromEncryptedCid,
  removeKeyFromEncryptedCid,
  convertBytesToBase64url,
} from '../utils/s5EncryptCIDHelper';
import useS5net from '../hooks/useS5';
import { ffmpegprogressstate } from '../atoms/ffmpegAtom';

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

/**
 * DropAudioS5 component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.field - The field name.
 * @param {string} props.twStyle - The tailwind CSS style.
 * @param {string} props.text - The text to display.
 * @param {Object} props.encKey - The encryption key.
 * @returns {JSX.Element} The DropAudioS5 component.
 */
const DropAudioS5 = ({ field, twStyle, text, encKey }) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchUrl = watch(field);

  const { uploadFile } = usePortal();
  const { transcodeAudio } = useTranscodeAudioS5();

  const { putMetadata } = useS5net();

  const [ffmpegProgress, setFFMPEGProgress] =
    useRecoilState(ffmpegprogressstate);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log('DropAudioS5: acceptedFiles = ', acceptedFiles);

    if (!acceptedFiles || acceptedFiles.length !== 1) {
      alert('Please upload single image only');
      return;
    }

    const isEncrypted = process.env.NEXT_PUBLIC_DEFAULT_IS_ENCRYPT === 'true';

    const customOptions = { encrypt: isEncrypted };
    const file = acceptedFiles[0];
    const origSourceCID = await uploadFile(file, customOptions);
    const sourceCID = origSourceCID.replace(
      /\.[^/.]+$/,
      process.env.NEXT_PUBLIC_DEFAULT_AUDIO_FILE_EXTENSION,
    );

    let key = '';
    if (customOptions.encrypt) {
      console.log('DropAudioS5: sourceCID = ', sourceCID);

      key = getKeyFromEncryptedCid(sourceCID);
      encKey.current = key;

      const cidWithoutKey = removeKeyFromEncryptedCid(sourceCID);
      console.log('DropAudioS5: cidWithoutKey= ', cidWithoutKey);

      setValue(field, cidWithoutKey);
    } else {
      encKey.current = '';
      setValue(field, sourceCID);

      console.log('DropAudioS5: sourceCID = ', sourceCID);
    }

    console.log('DropAudioS5: field = ', field);

    await transcodeAudio(origSourceCID, isEncrypted);
    setFFMPEGProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="sm:col-span-3">
      <div className="sm:col-span-3">
        <div
          {...getRootProps()}
          className={`mt-8 flex flex-col ${twStyle} relative mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-dark-gray fill-current text-fabstir-light-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
        >
          {!watchUrl && !ffmpegProgress && (
            <div>
              <input
                {...getInputProps()}
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
                className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-dark-gray fill-current text-fabstir-light-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm`}
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

export default DropAudioS5;
