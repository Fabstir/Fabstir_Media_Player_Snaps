import { ComponentProps } from 'react';
import { MetamaskState } from '../hooks';
import FlaskFox from '../assets/flask_fox.svg';
import { shouldDisplayReconnectButton } from '../utils';

export const InstallFlaskButton = () => (
  <a
    href="https://metamask.io/flask/"
    target="_blank"
    className="flex items-center justify-center text-sm rounded border border-white bg-white text-black font-bold px-4 py-2 cursor-pointer hover:bg-transparent hover:text-white transition-all"
  >
    <FlaskFox />
    <span className="ml-3">Install MetaMask Flask</span>
  </a>
);

export const ConnectButton = (props: ComponentProps<'button'>) => {
  return (
    <button
      {...props}
      className="flex items-center justify-center mt-auto w-full"
    >
      <FlaskFox />
      <span className="ml-3">Connect</span>
    </button>
  );
};

export const ReconnectButton = (props: ComponentProps<'button'>) => {
  return (
    <button
      {...props}
      className="flex items-center justify-center mt-auto w-full"
    >
      <FlaskFox />
      <span className="ml-3">Reconnect</span>
    </button>
  );
};

export const SendHelloButton = (props: ComponentProps<'button'>) => {
  return (
    <button {...props} className="mt-auto w-full">
      Send message
    </button>
  );
};

export const HeaderButtons = ({
  state,
  onConnectClick,
}: {
  state: MetamaskState;
  onConnectClick(): unknown;
}) => {
  if (!state.isFlask && !state.installedSnap) {
    return <InstallFlaskButton />;
  }

  if (!state.installedSnap) {
    return <ConnectButton onClick={onConnectClick} />;
  }

  if (shouldDisplayReconnectButton(state.installedSnap)) {
    return <ReconnectButton onClick={onConnectClick} />;
  }

  return (
    <div className="flex items-center justify-center text-sm rounded border border-white bg-white text-black font-bold px-4 py-2">
      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
      <span className="ml-3">Connected</span>
    </div>
  );
};
