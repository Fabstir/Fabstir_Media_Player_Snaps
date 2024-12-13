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
 * @param {boolean} [props.disabled=false] - Whether the toggle is disabled.
 * @returns {React.ReactElement} The rendered toggle switch component.
 */
export default function SimpleToggle({
  enabled,
  setEnabled,
  toggleText,
  disabled = false,
}) {
  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      disabled={disabled}
      className={classNames(
        enabled ? 'bg-fabstir-light-purple' : 'bg-fabstir-gray',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent shadow-[inset_0_-1px_0px_hsla(0,0%,100%,0.15),inset_0_1px_1px_hsla(0,0%,0%,0.15)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-fabstir-focus-colour1',
      )}
    >
      <span className="sr-only">{toggleText}</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled
            ? 'translate-x-5 bg-fabstir-light-gray'
            : 'translate-x-0 bg-fabstir-medium-light-gray',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out',
        )}
      />
    </Switch>
  );
}
