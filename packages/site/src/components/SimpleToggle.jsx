import React from 'react';
import { Switch } from '../ui-components/switch';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Renders a simple toggle switch component. This toggle allows users to switch between two states, such as enabled or disabled.
 * The visual appearance of the toggle changes based on the `enabled` state. Custom text for screen readers can be provided via `toggleText`.
 * The `setEnabled` function is called when the toggle is clicked, allowing the parent component to react to state changes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.enabled - The current state of the toggle, where `true` means enabled.
 * @param {Function} props.setEnabled - The function to call when the toggle is clicked, which should handle updating the `enabled` state.
 * @param {string} props.toggleText - Text for screen readers, describing the purpose of the toggle.
 * @returns {React.ReactElement} The rendered toggle switch component.
 */
export default function SimpleToggle({ enabled, setEnabled, toggleText }) {
  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={classNames(
        enabled ? '' : 'bg-gray',
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.15),inset_0_1px_1px_hsla(0,0%,0%,0.15)] transition-colors duration-200 ease-in-out focus:outline-none  focus:ring-2',
      )}
    >
      <span className="sr-only">{toggleText}</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled
            ? 'translate-x-5 bg-light-gray'
            : 'translate-x-0 ',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out',
        )}
      />
    </Switch>
  );
}
