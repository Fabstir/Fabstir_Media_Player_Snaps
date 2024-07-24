import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import useTranscodeAudio from '../hooks/useTranscodeAudio';
import usePortal from '../hooks/usePortal';
import {
  getKeyFromEncryptedCid,
  removeKeyFromEncryptedCid,
} from '../utils/s5EncryptCIDHelper';
import { Input } from '../ui-components/input';
import useNFTMedia from '../hooks/useNFTMedia';

const PROGRESS_UPDATE_INTERVAL = 500;

const ProgressBar = ({ progressPercentage }) => {
  return (
    <div className="h-2 w-full bg-fabstir-blue">
      <div
        style={{ width: `${progressPercentage}%` }}
        className={`h-full ${
          progressPercentage < 70
            ? 'bg-fabstir-gray'
            : 'bg-fabstir-medium-dark-gray'
        }`}
      ></div>
    </div>
  );
};

/**
 * `DropAudio` is a React component that renders an audio dropzone interface. It allows users to drag and drop audio files,
 * supporting specific formats, and performs actions based on the dropped content. The component can be styled using Tailwind CSS
 * and is configurable via props.
 *
 * @component
 * @param {Object} props - The props for the DropAudio component.
 * @param {Object} props.field - The formik field object to manage form data.
 * @param {string} props.twStyle - Tailwind CSS classes to apply custom styling.
 * @param {string} props.text - Text to display within the dropzone area.
 * @param {string} props.encKey - Encryption key for securing the audio files.
 * @param {Array<string>} props.audioFormats - List of supported audio formats (e.g., ['mp3', 'wav']).
 * @param {string} [props.storageNetwork=process.env.NEXT_PUBLIC_S5] - The storage network to use, defaults to the value of `NEXT_PUBLIC_S5` environment variable.
 */
const DropAudio = ({
  field,
  twStyle,
  text,
  encKey,
  audioFormats,
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
  const { transcodeAudio } = useTranscodeAudio();

  const { getTranscodeProgress } = useNFTMedia();

  const [ffmpegProgress, setFFMPEGProgress] = useState(0);
  const intervalRef = useRef(); // Create a ref to store the interval ID

  const [progressMessage, setProgressMessage] = useState('');

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

    setProgressMessage('Uploading...');
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

      // await putMetadata(key, cidWithoutKey, []);
      setValue(field, cidWithoutKey, true);
    } else {
      encKey.current = '';

      // await putMetadata(null, sourceCID, []);
      setValue(field, sourceCID, false);

      console.log('DropAudio: sourceCID = ', sourceCID);
    }

    console.log('DropAudio: field = ', field);

    const taskId = await transcodeAudio(
      sourceCID,
      isEncrypted,
      true,
      audioFormats,
    );
    setFFMPEGProgress(0);
    setProgressMessage('Queued for transcoding...');

    // Use the ref to store the interval ID
    intervalRef.current = setInterval(async () => {
      const progress = await getTranscodeProgress(taskId);
      setFFMPEGProgress(progress);

      if (progress > 0) setProgressMessage('Transcoding in progress...');

      console.log('DropAudio: progress = ', progress);

      if (progress >= 100) {
        clearInterval(intervalRef.current); // Clear interval using the ref
      }
    }, PROGRESS_UPDATE_INTERVAL); // The interval time
  }, []);

  useEffect(() => {
    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="sm:col-span-3">
      <div className="sm:col-span-3">
        <div
          {...getRootProps()}
          className={`mt-8 flex flex-col ${twStyle} relative mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
        >
          {!watchUrl && !ffmpegProgress && !progressMessage && (
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

          {progressMessage && ffmpegProgress < 100 && (
            <div
              className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm  w-2/3`}
            >
              <span>{progressMessage}</span>
            </div>
          )}
          {ffmpegProgress === 100 && (
            <div
              className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm  w-2/3`}
            >
              <span>Transcode completed!</span>
            </div>
          )}
          <div className="absolute bottom-0 w-full">
            <ProgressBar progressPercentage={ffmpegProgress} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropAudio;
