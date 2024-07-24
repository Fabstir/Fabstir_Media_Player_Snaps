import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import usePortal from '../hooks/usePortal';
import { Input } from '../ui-components/input';

/**
 * Renders a component for uploading a single file with drag-and-drop functionality. It integrates with `react-hook-form`
 * for form state management and uses a custom hook `usePortal` for file operations. The component visually indicates
 * the upload status and displays the uploaded file if available. It supports uploading only one file at a time and
 * provides feedback in case of errors.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.field - The form field name to which the uploaded file's identifier will be saved.
 * @param {string} props.twStyle - Tailwind CSS classes for custom styling of the dropzone.
 * @param {string} props.text - Text to display within the dropzone area, typically instructions or guidelines for uploading.
 * @returns {React.ReactElement} The DropSingleFile component.
 */
const DropSingleFile = ({ field, twStyle, text }) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [watchUrl, setWatchUrl] = useState();
  const { getPortalLinkUrl } = usePortal();

  const [fileNameState, setFileNameState] = useState();

  useEffect(() => {
    (async () => {
      const linkUrl = await getPortalLinkUrl(watch(field));
      setWatchUrl(linkUrl);
    })();
  }, [field, watch]);

  const { uploadFile } = usePortal();

  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log('acceptedFiles = ', acceptedFiles);

    if (!acceptedFiles || acceptedFiles.length !== 1) {
      alert('Please upload single image only');
      return;
    }

    const cid = await uploadFile(acceptedFiles[0]);
    console.log('cid = ', cid);

    setValue(field, cid);
    setFileNameState(acceptedFiles[0].name);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="sm:col-span-3">
      <div className="sm:col-span-3">
        <div
          {...getRootProps()}
          className={`mt-8 flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
        >
          {!watchUrl && !fileNameState && (
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
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-fabstir-dark-gray">
                  {errors[field].message}
                </p>
              )}
            </div>
          )}
          {fileNameState && <div className="mt-4">File uploaded</div>}
          {watchUrl && (
            <span className="">
              <img
                src={watchUrl}
                alt=""
                className="object-cover"
                crossOrigin="anonymous"
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropSingleFile;
