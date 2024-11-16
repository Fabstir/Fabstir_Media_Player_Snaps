import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export default function BadgeGiveToUserOrNFT() {
  const [submitText, setSubmitText] = useState('Give');

  const giveBadgeSchema = yup.object().shape({
    userPub: yup.string().required('Must have a user public key.'),
    nftAddress: yup.string().when('nftTokenId', {
      is: (val) => val !== undefined && val !== '',
      then: yup
        .string()
        .required('Both nftAddress and nftTokenId must be defined.'),
      otherwise: yup.string().notRequired(),
    }),
    nftTokenId: yup.string().when('nftAddress', {
      is: (val) => val !== undefined && val !== '',
      then: yup
        .string()
        .required('Both nftAddress and nftTokenId must be defined.'),
      otherwise: yup.string().notRequired(),
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    defaultValues: defaultBuy,
    resolver: yupResolver(buySchema),
  });

  const handleGiveBadgeToNFT = async (badge, nft) => {
    const minter = await minterOf(badge);
    const userAuthProfile = await getUserProfile(userAuthPub);

    if (
      minter === AddressZero ||
      (userAuthProfile.accountAddress === minter && badge.from === minter)
    ) {
      setHandleGiveBadgeToNFTText('Giving...');
      const userAuthPubProfile = await getUserProfile(userAuthPub);

      const uri = await createUri(badge);

      const newBadge = { ...badge, uri };
      const signature = await getSignature(userPub, newBadge, newBadge.giver);

      console.log('BadgeDropdown: newBadge = ', newBadge);

      await createBadgeToTake({
        ...newBadge,
        signature,
        nftAddress: nft.address,
        nftOwner: nft.creator,
        nftTokenId: nft.id,
      });
      setHandleGiveBadgeToNFTText('Given!');
    } else {
      setHandleGiveBadgeToNFTText('Error!');
    }

    setCurrentBadgeRequesting(null);
    setUserPubRequest(null);

    setOpenBadgeToGiveToNFT(false);
  };

  const handleGiveBadgeToAccount = async (badge, nft) => {
    const minter = await minterOf(badge);
    const userAuthProfile = await getUserProfile(userAuthPub);

    if (
      minter === AddressZero ||
      (userAuthProfile.accountAddress === minter && badge.from === minter)
    ) {
      setHandleGiveBadgeText('Giving...');
      //        const userAuthPubProfile = await getUserProfile(userAuthPub)
      const uri = await createUri(badge);

      const newBadge = { ...badge, uri };
      const signature = await getSignature(userPub, newBadge, newBadge.giver);

      console.log('BadgeDropdown: newBadge = ', newBadge);

      createBadgeToTake({
        ...newBadge,
        signature,
      });
      setHandleGiveBadgeText('Given!');
    } else {
      setHandleGiveBadgeText('Error!');
    }
    setOpenBadgeToGiveForAccount(false);
    setUserPubGive(null);
  };

  const handleGiveBadge = async (badge, nft) => {};

  return (
    <>
      {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <img
              alt="Your Company"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Give to User or NFT
            </h2>
          </div>
          <form
            onSubmit={handleSubmit(handle_DeleteMarketNFT)}
            className="space-y-6"
          >
            <div className="relative -space-y-px rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300" />
              <div>
                <label htmlFor="email-address" className="sr-only">
                  User Public Key
                </label>
                <Input
                  id="userPub"
                  name="userPub"
                  type="userPub"
                  required
                  placeholder="User Public Key"
                  autoComplete="userPub"
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  register={register('userPub')}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  NFT Address (optional)
                </label>
                <Input
                  id="nftAddress"
                  name="nftAddress"
                  type="nftAddress"
                  required
                  placeholder="NFT Address"
                  autoComplete="current-nftAddress"
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  register={register('nftAddress')}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  NFT Token Id (optional)
                </label>
                <Input
                  id="nftTokenId"
                  name="nftTokenId"
                  type="nftTokenId"
                  required
                  placeholder="NFTTokenId"
                  autoComplete="current-nftTokenId"
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  register={register('nftTokenId')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
