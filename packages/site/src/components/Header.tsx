import { useContext, useState } from 'react';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { connectSnap, getSnap } from '../utils';
import { HeaderButtons } from './Buttons';
import { SnapLogo } from './SnapLogo';
import { ThemeContext } from './ThemeContext';
/**
 * Header component to render the app header.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.handleToggleClick - The function to handle the toggle click event.
 * @returns {React.Element} The rendered Header component.
 */
export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const { theme, setTheme } = useContext(ThemeContext);

  /**
   * Function to handle the connect click event.
   * It connects to the Snap API and sets the installed Snap in the MetaMask context.
   *
   * @async
   * @function
   */
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

  /**
   * Function to save the selected theme mode in localStorage.
   * It listens to the change event of the select dropdown and stores the selected mode.
   *
   * @function
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event triggered by selecting a theme mode.
   */
  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  return (
    <header className="flex justify-between items-center p-6 border-b border-gray-200">
      <div className="flex items-center">
        <SnapLogo color="text-gray-700" size={36} />
        <p className="font-bold ml-3 hidden sm:block">template-snap</p>
        <div>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
      </div>
      <div className="flex items-center">
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </div>
    </header>
  );
};
