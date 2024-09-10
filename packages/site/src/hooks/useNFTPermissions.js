import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { useRecoilValue } from 'recoil';
import { userpubstate } from '../atoms/userAtom';
import { dbClient } from '../GlobalOrbit';

import { parseArrayProperties } from '../utils/stringifyProperties';

export const fetchNFT = async (userPub, nftAddressId) => {
  if (!nftAddressId) return null;

  const resultRetrieved = await new Promise((res) =>
    dbClient
      .user(userPub)
      .get('nfts permissions')
      .get(nftAddressId)
      .once((final_value) => res(final_value)),
  );

  console.log(
    'useNFTPermissions: fetchNFT: resultRetrieved = ',
    resultRetrieved,
  );

  if (!resultRetrieved) return;

  const result = parseArrayProperties(resultRetrieved);
  console.log('useNFTPermissions: fetchNFT: result = ', result);
  return result;
};

export const invalidQueryForNFT = async (userPub, nftAddressId) => {
  queryClient.invalidateQueries([userPub, nftAddressId, 'nfts permissions']);
  queryClient.getQueryData([userPub, nftAddressId, 'nfts permissions']);
};

export default function useNFTPermissions(nftAddressId) {
  const userPub = useRecoilValue(userpubstate);

  return useQuery(
    [userPub, nftAddressId, 'nfts permissions'],
    () => fetchNFT(userPub, nftAddressId),
    {
      placeholderData: () =>
        queryClient
          .getQueryData([userPub, nftAddressId, 'nfts permissions'])
          ?.find((d) => d.nftAddress == nftAddressId),
      staleTime: 0,
    },
  );
}
