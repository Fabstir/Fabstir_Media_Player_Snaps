import { ComponentProps } from 'react';
import { MetamaskState } from '../hooks';
import FlaskFox from '../assets/flask_fox.svg';
import { shouldDisplayReconnectButton } from '../utils';
import React, { createContext , useEffect , useState} from 'react';

export const InstallFlaskButton = ({ theme } : {theme: string}) => (
  <a
    href="https://metamask.io/flask/"
    target="_blank"
    className={`flex items-center justify-center text-sm rounded border border-white font-bold px-4 py-2 cursor-pointer hover:bg-transparent hover:text-white transition-all ${theme === 'dark' ? 'bg-dark-background text-dark-copy' : 'bg-background text-copy' }` }
  >
    <FlaskFox />
    <span className="ml-3">Install MetaMask Flask</span>
  </a>
);

export const ConnectButton = (props: ComponentProps<'button'>  & { theme: string }) => {
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

export const ReconnectButton = (props: ComponentProps<'button'>  & { theme: string }) => {
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

export const SendHelloButton = (props: ComponentProps<'button'>  & { theme: string }) => {
  return (
    <button {...props} className="mt-auto w-full">
      Send message
    </button>
  );
};

export const HeaderButtons = ({
  state,
  onConnectClick,
  theme,
}: {
  state: MetamaskState;
  onConnectClick(): unknown;
  theme : string;
}) => {

  console.log(theme);


  if (!state.isFlask && !state.installedSnap) {
    return <InstallFlaskButton theme = {theme} />;
  }

  if (!state.installedSnap) {
    return <ConnectButton onClick={onConnectClick} theme = {theme} />;
  }

  if (shouldDisplayReconnectButton(state.installedSnap)) {
    return <ReconnectButton onClick={onConnectClick} theme = {theme} />;
  }


  return (
    <div className={` flex items-center justify-center text-sm rounded border border-white bg-white text-black font-bold px-4 py-2 ${theme === 'dark' ? 'bg-dark-background text-white' : 'bg-white text-black' }`}>
      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
      <span className="ml-3">Connected</span>
    </div>
  );
};
