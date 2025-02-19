/* This example requires Tailwind CSS v2.0+ */
import React from 'react';
import { Switch } from '../ui-components/switch';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SimpleToggle({ enabled, setEnabled, toggleText }) {
  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={classNames(
        enabled ? 'bg-primary-light' : 'bg-gray',
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.15),inset_0_1px_1px_hsla(0,0%,0%,0.15)] transition-colors duration-200 ease-in-out focus:outline-none  focus:ring-2 focus:ring-fabstir-focus-colour1',
      )}
    >
      <span className="sr-only">{toggleText}</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? 'translate-x-5 bg-light-gray' : 'translate-x-0 bg-gray',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out',
        )}
      />
    </Switch>
  );
}
