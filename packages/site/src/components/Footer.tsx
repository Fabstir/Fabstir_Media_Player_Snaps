import MetaMaskFox from '../assets/metamask_fox.svg';
import { MetaMask } from './MetaMask';
import { PoweredBy } from './PoweredBy';

/**
 * Footer component to render the app footer.
 *
 * @component
 * @returns {React.Element} The rendered Footer component.
 */
export const Footer = () => {
  return (
    <footer className="flex items-center justify-center pt-6 pb-6 border-t border-gray-300">
      <a
        href="https://docs.metamask.io/"
        target="_blank"
        className="flex items-center justify-center px-4 py-3 rounded shadow bg-gray-200 hover:bg-gray-300 transition-all"
      >
        <MetaMaskFox />
        <div className="flex flex-col ml-3">
          {/* Assuming PoweredBy and MetaMask components accept a "className" prop to add Tailwind classes */}
          <PoweredBy className="text-gray-500" />
          <MetaMask className="text-black" />
        </div>
      </a>
    </footer>
  );
};
