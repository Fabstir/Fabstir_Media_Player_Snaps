import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import useTranscodeVideo from '../hooks/useTranscodeVideo';
import { useRecoilState } from 'recoil';
import usePortal from '../hooks/usePortal';
import { ffmpegprogressstate } from '../atoms/ffmpegAtom';
import {
  getKeyFromEncryptedCid,
  removeKeyFromEncryptedCid,
  removeExtensionFromCid,
} from '../utils/s5EncryptCIDHelper';
import { Input } from '../ui-components/input';
import useNFTMedia from '../hooks/useNFTMedia';

const PROGRESS_UPDATE_INTERVAL = 1000;

const ProgressBar = ({ progressPercentage }) => {
  return (
    <div className="h-2 w-full ">
      <div
        style={{ width: `${progressPercentage}%` }}
        className={`h-full ${
          progressPercentage < 70
            ? 'bg-gray'
            : 'bg-medium-dark-gray'
        }`}
      ></div>
    </div>
  );
};

/**
 * Renders a dropzone component specifically designed for video files. It allows users to upload a video by dragging and dropping it into the component.
 * The component supports encryption of the uploaded video if an encryption key is provided. It also handles video transcoding through external services,
 * displaying the progress of the transcoding process. The final video CID (Content Identifier) is managed within a form context using `react-hook-form`.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.field - The form field name where the video CID is stored.
 * @param {string} props.twStyle - Tailwind CSS classes for custom styling of the dropzone.
 * @param {string} props.text - Text displayed within the dropzone, usually as instructions.
 * @param {string} props.encKey - Optional encryption key for encrypting the uploaded video.
 * @param {Array<string>} props.videoFormats - Supported video formats for transcoding.
 * @param {string} [props.storageNetwork=process.env.NEXT_PUBLIC_S5] - The storage network where the video will be uploaded, defaults to the value from environment variables.
 * @returns {React.ReactElement} The DropVideo component.
 */
const DropVideo = ({
  field,
  twStyle,
  text,
  encKey,
  videoFormats,
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
  const { transcodeVideo } = useTranscodeVideo();

  const { getTranscodeProgress } = useNFTMedia();

  const [ffmpegProgress, setFFMPEGProgress] = useState(0);
  const intervalRef = useRef(); // Create a ref to store the interval ID

  const [progressMessage, setProgressMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log('DropVideo: acceptedFiles = ', acceptedFiles);

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
      console.log('DropVideo: sourceCID = ', sourceCID);

      key = getKeyFromEncryptedCid(sourceCID);
      encKey.current = key;

      const cidWithoutKey = removeKeyFromEncryptedCid(sourceCID);
      console.log('DropVideo: cidWithoutKey = ', cidWithoutKey);
      console.log('DropVideo: key = ', key);

      setValue(field, cidWithoutKey, true);
    } else {
      const sourceCIDWithoutExtension = removeExtensionFromCid(sourceCID);
      setValue(field, sourceCIDWithoutExtension, false);

      console.log(
        'DropVideo: sourceCIDWithoutExtension = ',
        sourceCIDWithoutExtension,
      );
    }

    console.log('DropVideo: field = ', field);

    const taskId = await transcodeVideo(
      sourceCID,
      isEncrypted,
      true,
      videoFormats,
    );
    setFFMPEGProgress(0);
    setProgressMessage('Queued for transcoding...');

    // Use the ref to store the interval ID
    intervalRef.current = setInterval(async () => {
      const progress = await getTranscodeProgress(taskId);
      setFFMPEGProgress(progress);
      console.log('DropVideo: ffmpegProgress = ', progress);

      if (progress > 0) setProgressMessage('Transcoding in progress...');

      console.log('DropVideo: progress = ', progress);

      if (progress >= 100) {
        clearInterval(intervalRef.current); // Clear interval using the ref
      }
    }, PROGRESS_UPDATE_INTERVAL); // The interval time

    // No need to return a cleanup function here since it's handled by the useEffect below
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
          className={`mt-8 flex flex-col ${twStyle} relative mx-auto rounded-md border-2 border-gray bg-light-gray fill-current text-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
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
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                  {errors[field].message}
                </p>
              )}

              {/* {transcodeVideoInfo?.isLoading && <p>Transcoding...</p>}
              {transcodeVideoInfo?.isError && <p>Transcode error</p>} */}
            </div>
          )}
          {progressMessage && ffmpegProgress < 100 && (
            <div
              className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-gray bg-light-gray fill-current text-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm w-2/3`}
            >
              <span>{progressMessage}</span>
            </div>
          )}
          {ffmpegProgress === 100 && (
            <div
              className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-gray bg-light-gray fill-current text-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm w-2/3`}
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

export default DropVideo;
