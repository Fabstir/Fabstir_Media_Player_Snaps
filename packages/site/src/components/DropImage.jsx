/**
 * This example requires Tailwind CSS v2.0+
 * DropImage Component: A component to upload and display an image using a dropzone.
 * @module components/DropImage
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import usePortal from '../hooks/usePortal';

/**
 * DropImage Component
 * @param {Object} props - Properties passed to the component
 * @param {string} props.field - The field name
 * @param {string} props.twStyle - Tailwind CSS styles as a string
 * @param {string} props.text - Text to display in the dropzone
 * @returns {JSX.Element} - Rendered DropImage component
 */
const DropImage = ({ field, twStyle, text }) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [watchUrl, setWatchUrl] = useState();
  const { getBlobUrl } = usePortal();

  /**
   * useEffect hook to watch the field and update the watchUrl state.
   */
  useEffect(() => {
    (async () => {
      const linkUrl = await getBlobUrl(watch(field));
      setWatchUrl(linkUrl);
    })();
  }, [field, watch]);

  const { uploadFile } = usePortal();

  /**
   * Callback function to handle file drop event.
   * @param {File[]} acceptedFiles - Array of accepted files
   */
  const onDrop = useCallback(async (acceptedFiles) => {
    console.log('acceptedFiles = ', acceptedFiles);

    if (!acceptedFiles || acceptedFiles.length !== 1) {
      alert('Please upload single image only');
      return;
    }

    const cid = await uploadFile(acceptedFiles[0]);
    console.log('cid = ', cid);

    setValue(field, cid);
    setWatchUrl(await getBlobUrl(cid));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="sm:col-span-3">
      <div className="sm:col-span-3">
        <div
          {...getRootProps()}
          className={`mt-8 flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-dark-gray fill-current text-fabstir-light-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
        >
          {!watchUrl && (
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
            </div>
          )}
          {watchUrl && (
            <div
              className={`mx-auto mt-8 flex flex-col rounded-md border-2 border-fabstir-gray bg-fabstir-dark-gray fill-current text-fabstir-light-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm`}
            >
              <span className="">
                <img
                  src={watchUrl}
                  alt=""
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropImage;
