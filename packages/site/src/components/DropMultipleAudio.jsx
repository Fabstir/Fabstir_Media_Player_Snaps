import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import useTranscodeAudio from '../hooks/useTranscodeAudio';
import usePortal from '../hooks/usePortal';
import useNFTMedia from '../hooks/useNFTMedia';
import { Input } from '../ui-components/input';
import { XCircleIcon } from '@heroicons/react/solid'; // Using Heroicons for the error icon

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
 * `DropMultipleAudio` is a React component that provides a drag-and-drop interface for uploading multiple audio files.
 * It allows users to drag and drop audio files into a designated area, and it supports multiple file uploads simultaneously.
 * The component can be styled using Tailwind CSS and is configurable via props.
 *
 * @component
 * @param {Object} props - The props for the DropMultipleAudio component.
 * @param {Object} props.field - The formik field object to manage form data.
 * @param {string} props.twStyle - Tailwind CSS classes to apply custom styling.
 * @param {string} props.text - Text to display within the dropzone area.
 * @param {string} props.encKey - Encryption key for securing the audio files.
 * @param {Array<string>} props.audioFormats - List of supported audio formats (e.g., ['mp3', 'wav']).
 * @param {string} [props.storageNetwork=process.env.NEXT_PUBLIC_S5] - The storage network to use, defaults to the value of `NEXT_PUBLIC_S5` environment variable.
 */
const DropMultipleAudio = ({
  field,
  fieldName,
  twStyle,
  text,
  encKey,
  audioFormats,
  storageNetwork = process.env.NEXT_PUBLIC_S5,
  maxNumberOfFiles = 1,
}) => {
  const {
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const { uploadFile } = usePortal(storageNetwork);
  const { transcodeAudio } = useTranscodeAudio();
  const { getTranscodeProgress } = useNFTMedia();
  const [ffmpegProgress, setFFMPEGProgress] = useState(0);
  const intervalRef = useRef(); // Create a ref to store the interval ID

  const [fileProgress, setFileProgress] = useState({});
  const [progressMessage, setProgressMessage] = useState('');

  const [fileNames, setFileNames] = useState([]);
  const [failedFiles, setFailedFiles] = useState([]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) {
        alert('Please upload at least one audio file');
        return;
      }

      if (acceptedFiles.length > maxNumberOfFiles) {
        alert(`Please upload a maximum of ${maxNumberOfFiles} file(s) only.`);
        return;
      }

      const isEncrypted = encKey ? true : false;
      const customOptions = { encrypt: isEncrypted };
      setProgressMessage('Uploading...');

      const fileProgressMap = {}; // Track progress of each file

      for (const file of acceptedFiles) {
        const sourceCID = await uploadFile(file, customOptions).catch(
          (error) => {
            console.error('Error uploading file:', error);
            setFailedFiles((prev) => [...prev, file.name]);
            return null;
          },
        );

        if (!sourceCID) continue; // Skip this file if upload failed

        let cidWithFileName = `${sourceCID}<<${file.name}>>`;

        let currentFileUrls = getValues(field) || [];
        currentFileUrls.push(cidWithFileName);
        setValue(field, currentFileUrls, { shouldValidate: true });

        setFileNames((prevFileNames) => [...prevFileNames, file.name]);

        const taskId = await transcodeAudio(
          sourceCID,
          isEncrypted,
          true,
          audioFormats,
        ).catch((error) => {
          console.error('Error starting transcode task:', error);
          setFailedFiles((prev) => [...prev, file.name]);
          return null;
        });

        if (!taskId) continue; // Skip this file if transcoding failed

        setFFMPEGProgress(0);
        setProgressMessage('Queued for transcoding...');

        fileProgressMap[file.name] = 0; // Initialize progress for this file

        intervalRef.current = setInterval(async () => {
          const progress = await getTranscodeProgress(taskId);
          fileProgressMap[file.name] = progress; // Update progress for this file

          // Calculate overall progress
          const totalProgress = Object.values(fileProgressMap).reduce(
            (acc, curr) => acc + curr,
            0,
          );
          const overallProgress = totalProgress / acceptedFiles.length;

          setFFMPEGProgress(overallProgress);
          setProgressMessage('Transcoding in progress...');
          console.log('DropVideo: overallProgress = ', overallProgress);

          if (overallProgress >= 100) {
            clearInterval(intervalRef.current); // Clear interval using the ref
          }
        }, PROGRESS_UPDATE_INTERVAL); // The interval time
      }
    },
    [
      field,
      uploadFile,
      transcodeAudio,
      getTranscodeProgress,
      setValue,
      getValues,
      encKey,
      audioFormats,
      maxNumberOfFiles,
    ],
  );

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
      <div
        {...getRootProps()}
        className={`mt-8 flex flex-col ${twStyle} relative mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
      >
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
        {fileNames.length === 0 ? (
          <p>{text}</p>
        ) : (
          <div className="mt-4">
            <div className="mb-2 flex items-center">
              <p>{fileNames.join(', ')}</p>
            </div>
          </div>
        )}
        {errors[field] && (
          <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-light-pink">
            {errors[field].message}
          </p>
        )}

        {progressMessage && ffmpegProgress < 100 && (
          <div
            className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm w-2/3`}
          >
            <span>{progressMessage}</span>
          </div>
        )}

        {ffmpegProgress === 100 && (
          <div
            className={`flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm w-2/3`}
          >
            <span>Transcode completed!</span>
          </div>
        )}
        <div className="absolute bottom-0 w-full">
          <ProgressBar progressPercentage={ffmpegProgress} />
        </div>
      </div>
    </div>
  );
};

export default DropMultipleAudio;
