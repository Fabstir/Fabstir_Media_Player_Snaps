import React from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function NFTFileUrls({ field, fileUrls, handle_DownloadFile }) {
  function getFileName(uri) {
    const init = uri.indexOf('<<')
    const fin = uri.indexOf('>>')
    const fileName = uri.substr(init + 2, fin - init - 2)

    return fileName
  }

  function getUrl(uri) {
    const url = uri.substring(0, uri.lastIndexOf('<<'))

    return url
  }

  return (
    <div>
      {field.toLowerCase().endsWith('urls') ? (
        <>
          {fileUrls?.map((fileUrl, idx) => (
            <p>
              {getFileName(fileUrl)}{' '}
              <a
                onClick={(e) => {
                  e.preventDefault()
                  handle_DownloadFile(field, fileUrl)
                }}
              >
                {`[${getUrl(fileUrl)}]`}
              </a>
            </p>
          ))}
        </>
      ) : (
        <a
          onClick={(e) => {
            e.preventDefault()
            handle_DownloadFile(field, fileUrls)
          }}
        >
          {fileUrls}
        </a>
      )}
    </div>
  )
}
