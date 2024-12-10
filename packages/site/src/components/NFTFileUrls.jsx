import React from 'react';
import Tippy from '@tippyjs/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function NFTFileUrls({ field, fileUrls, handle_DownloadFile }) {
  console.log('NFTFileUrls: field = ', field);
  console.log('NFTFileUrls: fileUrls = ', fileUrls);

  function getFileName(uri) {
    const init = uri.indexOf('<<');
    const fin = uri.indexOf('>>');
    const fileName = uri.substr(init + 2, fin - init - 2);

    return fileName;
  }

  function getUrl(uri) {
    const url = uri.substring(0, uri.lastIndexOf('<<'));

    return url;
  }

  return (
    <div>
      {field.toLowerCase().endsWith('urls') ? (
        <>
          {fileUrls?.map((fileUrl, idx) => (
            <p key={idx}>
              ({getFileName(fileUrl)}){' '}
              <a
                className="cursor-pointer text-blue-500 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  handle_DownloadFile(field, fileUrl);
                }}
              >
                {/* Truncate the URL if it's longer than 30 characters for display purposes.
                 Add ellipsis to indicate truncation*/}
                {(() => {
                  const url = getUrl(fileUrl);
                  const displayUrl =
                    url.length > 30
                      ? `[${url.slice(0, 25)}...${url.slice(-5)}]`
                      : `[${url}]`;
                  return (
                    <Tippy
                      content={url}
                      interactive={true}
                      maxWidth="none"
                      className="bg-gray-800 p-2 rounded text-white whitespace-pre-wrap break-words"
                      placement="top"
                    >
                      <span>{displayUrl}</span>
                    </Tippy>
                  );
                })()}
              </a>
            </p>
          ))}
        </>
      ) : (
        <a
          className="cursor-pointer text-blue-500 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            handle_DownloadFile(field, fileUrls);
          }}
        >
          {fileUrls}
        </a>
      )}
    </div>
  );
}
