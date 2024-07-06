import { SEA } from 'gun';
import { dbClient } from '../GlobalOrbit';
import { stringifyArrayProperties } from '../utils/stringifyProperties';
import { convertAttributesToNFT721Convention } from '../utils/nftUtils';
import useIPFS from './useIPFS';

export default function useSendBadge() {
  const ipfs = useIPFS();

  const sendBadge = async (userPub, badge) => {
    const newBadge = JSON.stringify(stringifyArrayProperties(badge));

    var hash = await SEA.work(newBadge, null, null, { name: 'SHA-256' });
    console.log('useSendBadge: hash = ', hash);

    dbClient
      .get('#' + userPub)
      .get(hash)
      .put(newBadge);
  };

  const createUri = async (badge) => {
    let badgeMetaData = { ...badge };
    delete badgeMetaData.name;
    delete badgeMetaData.symbol;

    if (badgeMetaData.attributes)
      badgeMetaData.attributes = convertAttributesToNFT721Convention(
        badgeMetaData.attributes,
      );
    console.log('useMintBadge: badgeMetaData = ', badgeMetaData);

    const metaDataFileObject = new File(
      [
        new Blob([JSON.stringify(badgeMetaData)], {
          lastModified: Date.now(), // optional - default = now
          type: 'text/plain', // optional - default = ''
        }),
      ],
      'ABTTokenMetadata.json',
    );

    const cid = await ipfs.uploadFile(metaDataFileObject);
    console.log('useSendBadge: createUri cid = ', cid);
    return cid;
  };

  return { sendBadge, createUri };
}
