import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import usePortal from '../hooks/usePortal';
import { Input } from '../ui-components/input';

/**
 * Creates a dropzone component for uploading images, utilizing the `usePortal` hook for file operations
 * and integrating with the form context from `react-hook-form`. The component supports dragging and dropping
 * an image file, which is then uploaded to a specified storage network. The uploaded image's URL is watched
 * and displayed within the component. If an error occurs during the file upload process, it is displayed to the user.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.field - The name of the field in the form for storing the uploaded image's CID.
 * @param {string} props.twStyle - Tailwind CSS classes for styling the dropzone component.
 * @param {string} props.text - Text to display within the dropzone area.
 * @param {string} [props.storageNetwork=process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK] - The default storage network to use for uploading files.
 * @param {React.Ref} ref - Ref forwarded to the dropzone div element.
 * @returns {React.ReactElement} The DropImage component.
 */
const DropImage = React.forwardRef(
  (
    {
      field,
      twStyle,
      text,
      storageNetwork = process.env.NEXT_PUBLIC_DEFAULT_STORAGE_NETWORK,
    },
    ref,
  ) => {
    const {
      watch,
      setValue,
      formState: { errors },
    } = useFormContext();

    const [watchUrl, setWatchUrl] = useState();
    //  const { getBlobUrl } = usePortal()
    const { uploadFile, getBlobUrl } = usePortal(storageNetwork);

    useEffect(() => {
      (async () => {
        const linkUrl = await getBlobUrl(watch(field));
        setWatchUrl(linkUrl);
      })();
    }, [field, watch]);

    const onDrop = useCallback(async (acceptedFiles) => {
      // Do something with the files
      console.log('DropImage: acceptedFiles = ', acceptedFiles);

      if (!acceptedFiles || acceptedFiles.length !== 1) {
        alert('Please upload single image only');
        return;
      }

      const cid = await uploadFile(acceptedFiles[0]);
      console.log('DropImage: cid = ', cid);

      setValue(field, cid);
      setWatchUrl(await getBlobUrl(cid));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
    });

    return (
      <div ref={ref} className="sm:col-span-3">
        <div className="sm:col-span-3">
          <div
            {...getRootProps()}
            className={`mt-8 flex flex-col ${twStyle} mx-auto rounded-md border-2 border-gray bg-light-gray fill-current text-dark-gray shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:items-center sm:justify-center sm:text-center sm:text-sm`}
          >
            {!watchUrl && (
              <div>
                <Input
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
                  <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-error dark:text-dark-error">
                    {errors[field].message}
                  </p>
                )}
              </div>
            )}
            {watchUrl && (
              <div
                className={`mx-auto mt-8 flex flex-col rounded-md border-2 border-gray bg-light-gray fill-current text-dark-gray shadow-sm sm:items-center sm:justify-center sm:text-center sm:text-sm`}
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
  },
);

export default DropImage;
