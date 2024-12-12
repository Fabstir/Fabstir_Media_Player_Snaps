import { dbClient } from '../GlobalOrbit';
import { user } from '../user';

/**
 * Custom hook to handle color customization.
 *
 * This hook provides functions to save, load, import, and export color customizations.
 * It interacts with the user's profile to store and retrieve color settings.
 *
 * @returns {Object} An object containing functions for color customization:
 * - saveColorCustomization: Saves the color customization to the user's profile.
 * - loadColorCustomization: Loads the color customization from the user's profile.
 * - deleteColorCustomization: Deletes the color customization from the user's profile.
 * - exportColorCustomization: Exports the color customization to a JSON file.
 * - importColorCustomization: Imports the color customization from a JSON file.
 */
export default function useColorCustomization() {
  const saveColorCustomization = async (colorCustomization) => {
    if (!colorCustomization)
      throw new Error('useColorCustomization: Color customization is required');

    const colorCustomizationStringified = JSON.stringify(colorCustomization);

    await new Promise((resolve, reject) => {
      user.get('color').put(colorCustomizationStringified, function (ack) {
        if (ack.err) {
          console.error('useColorCustomization: Error writing data:', ack.err);
          reject(new Error('useColorCustomization: Error writing data'));
        } else {
          console.log('useColorCustomization: Data saved successfully.');
          resolve();
        }
      });
    });
  };

  const loadColorCustomization = async (userPub) => {
    if (!userPub)
      throw new Error('loadColorCustomization: User public key is required');

    const colorCustomizationStringified = await new Promise((res) =>
      dbClient
        .user(userPub)
        .get('color')
        .once((final_value) => res(final_value)),
    );

    if (!colorCustomizationStringified) return;

    const colorCustomization = JSON.parse(colorCustomizationStringified);
    console.log(
      'useColorCustomization: colorCustomization = ',
      colorCustomization,
    );

    return colorCustomization;
  };

  const deleteColorCustomization = () => {
    user.get('color').put(null, function (ack) {
      if (ack.err) {
        console.error('useColorCustomization: Error deleting data:', ack.err);
      } else {
        console.log('useColorCustomization: Data deleted');
      }
    });
  };

  const exportColorCustomization = async () => {
    const colorCustomization = await loadColorCustomization(user.is.pub);
    if (!colorCustomization) return;

    const blob = new Blob([JSON.stringify(colorCustomization, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-customization.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importColorCustomization = async (json) => {
    await saveColorCustomization(json);
  };

  return {
    saveColorCustomization,
    loadColorCustomization,
    deleteColorCustomization,
    exportColorCustomization,
    importColorCustomization,
  };
}
