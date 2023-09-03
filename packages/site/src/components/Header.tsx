import { useContext } from 'react';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getThemePreference, getSnap } from '../utils';
import { HeaderButtons } from './Buttons';
import { SnapLogo } from './SnapLogo';
//import { Toggle } from './Toggle';

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <header className="flex justify-between items-center p-6 border-b border-gray-200">
      <div className="flex items-center">
        <SnapLogo color="text-gray-700" size={36} />
        <p className="font-bold ml-3 hidden sm:block">template-snap</p>
      </div>
      <div className="flex items-center">
        {/* <Toggle
          onToggle={handleToggleClick}
          defaultChecked={getThemePreference()}
        /> */}
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </div>
    </header>
  );
};
