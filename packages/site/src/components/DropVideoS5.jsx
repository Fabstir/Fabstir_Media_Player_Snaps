import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import useTranscodeVideoS5 from '../hooks/useTranscodeVideoS5';
import { useRecoilValue, useRecoilState } from 'recoil';
import usePortal from '../hooks/usePortal';
import {
  getBase64UrlEncryptedBlobHash,
  getKeyFromEncryptedCid,
  removeKeyFromEncryptedCid,
  convertBytesToBase64url,
} from '../utils/s5EncryptCIDHelper';
import { ffmpegprogressstate } from '../atoms/ffmpegAtom';
import { CheckIcon } from '@heroicons/react/24/solid';

/**
 * ProgressBar Component
 * @param {Object} props - Properties passed to the component
 * @param {number} props.progressPercentage - The percentage of the progress to be displayed
 * @returns {JSX.Element} - Rendered ProgressBar component
 */
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
 * DropVideoS5 Component
 * @param {Object} props - Properties passed to the component
 * @param {string} props.field - The field name
 * @param {string} props.twStyle - Tailwind CSS styles as a string
 * @param {string} props.text - Text to display in the dropzone
 * @param {Object} props.encKey - Encryption key reference
 * @returns {JSX.Element} - Rendered DropVideoS5 component
 */
const DropVideoS5 = ({ field, twStyle, text, encKey }) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const watchUrl = watch(field);

  const { uploadFile } = usePortal();
  const { transcodeVideo } = useTranscodeVideoS5();

  const [ffmpegProgress, setFFMPEGProgress] =
    useRecoilState(ffmpegprogressstate);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log('DropVideoS5: acceptedFiles = ', acceptedFiles);

    if (!acceptedFiles || acceptedFiles.length !== 1) {
      alert('Please upload single image only');
      return;
    }

    const isEncrypted = process.env.NEXT_PUBLIC_DEFAULT_IS_ENCRYPT === 'true';

    const customOptions = { encrypt: isEncrypted };
    const file = acceptedFiles[0];
    const sourceCID = await uploadFile(file, customOptions);

    let key = '';
    if (customOptions.encrypt) {
      console.log('DropVideoS5: sourceCID = ', sourceCID);

      key = getKeyFromEncryptedCid(sourceCID);
      encKey.current = key;

      const cidWithoutKey = removeKeyFromEncryptedCid(sourceCID);
      console.log('DropVideoS5: cidWithoutKey= ', cidWithoutKey);

      setValue(field, cidWithoutKey);
    } else {
      encKey.current = '';
      setValue(field, sourceCID);

      console.log('DropVideoS5: sourceCID = ', sourceCID);
    }

    console.log('DropVideoS5: field = ', field);

    await transcodeVideo(sourceCID, isEncrypted, true);
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
          {!watchUrl && !ffmpegProgress ? (
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

              {/* {transcodeVideoInfo?.isLoading && <p>Transcoding...</p>}
              {transcodeVideoInfo?.isError && <p>Transcode error</p>} */}
            </div>
          ) : (
            <CheckIcon className="ml-2 w-6" />
          )}

          {ffmpegProgress > 0 &&
            ffmpegProgress < 1 &&
            !transcodeVideoInfo?.isSuccess && (
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

export default DropVideoS5;
