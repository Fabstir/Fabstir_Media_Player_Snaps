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
        <p className="font-bold ml-3 hidden sm:block">Template Snap</p>
        {/* <div>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="h-10 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ml-1"
          >
            <option className="p-2" value="light">
              Light Mode
            </option>
            <option value="dark">Dark Mode</option>
          </select>
        </div> */}
       
      </div>
      <div className="flex items-center">
      <button
          type="button"
          className="dark:hidden block  font-medium text-black rounded-full bg-slate-100 hover:bg-slate-300 focus:outline-none focus:bg-slate-300"
          onClick={() => handleThemeChange('dark')}
        >
          <span className="group inline-flex shrink-0 justify-center items-center size-12">
            <svg
              className="shrink-0 size-6"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </span>
        </button>
        <button
          type="button"
          className="dark:block hidden font-medium text-black rounded-full bg-slate-100 hover:bg-slate-300 focus:outline-none focus:bg-slate-300"
          onClick={() => handleThemeChange('light')}
        >
          <span className="group inline-flex shrink-0 justify-center items-center size-12">
            <svg
              className="shrink-0 size-6"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
          </span>
        </button>
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
      </div>
    </header>
  );
};
