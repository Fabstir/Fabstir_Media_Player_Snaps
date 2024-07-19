import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import usePortal from '../hooks/usePortal';

/**
 * DropFile Component
 * @param {Object} props - Properties passed to the component
 * @param {string} props.field - The field name
 * @param {string} props.fieldName - The field name for storing file names
 * @param {string} props.twStyle - Tailwind CSS styles
 * @param {string} props.text - Text to display when no file is selected
 * @param {number} [props.maxNumberOfFiles=1] - Maximum number of files that can be uploaded
 * @returns {JSX.Element} - Rendered DropFile component
 */
const DropFile = ({
  field,
  fieldName,
  twStyle,
  text,
  maxNumberOfFiles = 1,
}) => {
  const {
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();
  const [watchUrl, setWatchUrl] = useState();
  const { getBlobUrl, uploadFile } = usePortal();
  const [fileNamesState, setFileNamesState] = useState();

  useEffect(() => {
    if (watch(field) && typeof watch(field) === 'string') {
      (async () => {
        const linkUrl = await getBlobUrl(watch(field));
        setWatchUrl(linkUrl);
      })();
    }
  }, [field, watch]);

  useEffect(() => {
    const fileNames = getValues(fieldName);
    if (!fileNames) {
      setValue(fieldName, [text]);
      setFileNamesState([text]);
    }
  }, []);

  /**
   * Handles file drop event
   * @param {File[]} acceptedFiles - The files that were dropped
   */
  const onDrop = useCallback(async (acceptedFiles) => {
    console.log('DropFile: acceptedFiles = ', acceptedFiles);

    if (!acceptedFiles || acceptedFiles.length > maxNumberOfFiles) {
      alert(`Please upload a maximum of ${maxNumberOfFiles} file(s) only.`);
      return;
    }

    for (const idx in acceptedFiles) {
      const acceptedFile = acceptedFiles[idx];
      console.log('DropFile: acceptedFile = ', acceptedFile);
      const cid = await uploadFile(acceptedFile);
      console.log('cid = ', cid);

      let fileUrls = getValues(field);
      if (fileUrls) fileUrls.push(`${cid}<<${acceptedFile.name}>>`);
      else fileUrls = [`${cid}<<${acceptedFile.name}>>`];

      console.log('DropFile: fileUrls = ', fileUrls);
      setValue(field, fileUrls);

      let fileNames = getValues(fieldName);
      if (fileNames && fileNames.length > 0 && fileNames[0] !== text)
        fileNames.push(acceptedFile.name);
      else fileNames = [acceptedFile.name];

      setValue(fieldName, fileNames);
      setFileNamesState(fileNames);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="sm:col-span-3">
      <div className="sm:col-span-3">
        <div
          {...getRootProps()}
          className={`mt-8 flex flex-col ${twStyle} mx-auto rounded-md border-2 border-fabstir-gray bg-fabstir-light-gray fill-current text-fabstir-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
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
              {fileNamesState ? (
                <div className="mt-4">
                  {fileNamesState.map((fileName) => (
                    <p>{fileName}</p>
                  ))}
                </div>
              ) : (
                <div>{text}</div>
              )}
            </div>
          )}
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

export default DropFile;
