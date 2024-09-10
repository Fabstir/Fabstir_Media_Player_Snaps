import { useMutation } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { queryClient } from '../../pages/_app.tsx';
import { user } from '../user';
import { stringifyArrayProperties } from '../utils/stringifyProperties';
import { selectedparentnftaddressid } from '../atoms/nestableNFTAtom.js';
import { userauthpubstate } from '../atoms/userAuthAtom.js';

export default function useCreateNFTPermissions() {
  const userAuthPub = useRecoilValue(userauthpubstate);
  const selectedParentNFTAddressId = useRecoilValue(selectedparentnftaddressid);

  return useMutation(
    ({ nftAddressId, permissions }) => {
      console.log('useCreateNFTPermissions: addressId = ', nftAddressId);
      console.log('useCreateNFTPermissions: permissions = ', permissions);

      const newPermissions = stringifyArrayProperties(permissions);

      user
        .get('nfts permissions')
        .get(nftAddressId)
        .put(newPermissions, function (ack) {
          if (ack.err) {
            console.error(
              'useCreateNFTPermissions: Error writing data:',
              ack.err,
            );
          } else {
            console.log(
              'useCreateNFTPermissions: nftAddressId = ',
              nftAddressId,
            );
          }
        });
    },
    {
      onMutate: ({ nftAddressId, permissions }) => {
        console.log('useCreateNFTPermissions: newAddressId = ', nftAddressId);

        queryClient.cancelQueries([userAuthPub, 'nfts permissions']);

        let oldNFTsPermissions = queryClient.getQueryData([
          userAuthPub,
          'nfts permissions',
        ]);
        console.log(
          'useCreateNFTPermissions: oldNFTPermissions = ',
          oldNFTsPermissions,
        );

        queryClient.setQueryData([userAuthPub, 'nfts permissions'], (old) => {
          return old
            ? [
                ...old,
                {
                  ...permissions,
                  isPreview: true,
                },
              ]
            : [
                {
                  ...permissions,
                  isPreview: true,
                },
              ];
        });

        const newNFTsPermissions = queryClient.getQueryData([
          userAuthPub,
          'nfts permissions',
        ]);
        console.log(
          'useCreateNFTPermissions: newNFTPermissions = ',
          newNFTsPermissions,
        );

        return () =>
          queryClient.setQueryData(
            [userAuthPub, 'nfts permissions'],
            oldNFTsPermissions,
          );
      },
      onError: (error, newNFT, rollback) => {
        console.log('useCreateNFT: error = ', error);
        rollback();
      },
      onSuccess: (data, newNFTPermissions) => {
        queryClient.invalidateQueries([userAuthPub, 'nfts permissions']);
        queryClient.getQueryData([userAuthPub, 'nfts permissions']);
      },
    },
  );
}
