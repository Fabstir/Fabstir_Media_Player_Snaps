import { dbClient } from '../GlobalOrbit';
import { user } from '../user';

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

  return {
    saveColorCustomization,
    loadColorCustomization,
    deleteColorCustomization,
  };
}
