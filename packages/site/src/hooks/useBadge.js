import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../pages/_app.tsx';

import { useRecoilValue } from 'recoil';
import { userpubstate } from '../atoms/userAtom';
import { dbClient } from '../GlobalOrbit';

const fetchBadge = async (badgeAddressId) => {
  if (!badgeAddressId) return null;

  const what = await new Promise((res) =>
    dbClient
      .get('badges')
      .get(badgeAddressId)
      .once((final_value) => res(final_value)),
  );

  let result = JSON.parse(what);

  if (result) {
    if (result.attributes) result['attributes'] = JSON.parse(result.attributes);
    if (result.fileUrls) result['fileUrls'] = JSON.parse(result.fileUrls);
  }

  return result;
};

export const prefetchBadge = (badgeAddressId) => {
  queryClient.prefetchQuery(
    ['badge', badgeAddressId],
    () => fetchBadge(badgeAddressId),
    {
      staleTime: 5000,
    },
  );
};

export default function useBadge(badgeAddressId) {
  const userPub = useRecoilValue(userpubstate);

  return useQuery(['badge', badgeAddressId], () => fetchBadge(badgeAddressId), {
    placeholderData: queryClient
      .getQueryData([userPub, 'badges'])
      ?.find((d) => d.badgeAddress == badgeAddressId),
    staleTime: 10000,
  });
}
