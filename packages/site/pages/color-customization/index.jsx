import React, { useState, useEffect, useContext } from 'react';
import useCreateUser from '../../src/hooks/useCreateUser';
import BlockchainContext from '../../state/BlockchainContext';
import { ChromePicker } from 'react-color';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Loader from '../../src/components/Loader';
import chroma from 'chroma-js';
import { TextLink } from '../../src/ui-components/text';
import { ChevronDoubleLeftIcon } from 'heroiconsv1/solid';
import { useRecoilValue } from 'recoil';
import { userauthpubstate } from '../../src/atoms/userAuthAtom';
import useUserProfile from '../../src/hooks/useUserProfile';
import { Button } from '../../src/ui-components/button';
import { Input } from '../../src/ui-components/input';
import useColorCustomization from '../../src/hooks/useColorCustomization';

/**
 * Color component.
 *
 * This component handles the color customization for the application.
 * It allows users to import, export, and save color customizations.
 * The component also loads default colors for new users who haven't defined their color customization yet.
 *
 * @component
 * @returns {React.Element} The rendered Color component.
 */
const Color = () => {
  const router = useRouter();
  const userAuthPub = useRecoilValue(userauthpubstate);
  const [, , , , , , getUserColor] = useUserProfile();
  const blockchainContext = useContext(BlockchainContext);
  const { setSmartAccount, setConnectedChainId } = blockchainContext;
  const { signOut, putUserColor } = useCreateUser();
  const {
    saveColorCustomization,
    loadColorCustomization,
    importColorCustomization,
    exportColorCustomization,
  } = useColorCustomization();
  const [showPicker, setShowPicker] = useState(false);
  const [showPickerSecondary, setShowPickerSecondary] = useState(false);
  const [showNeutralPicker, setShowNeutralPicker] = useState(false);
  const [showUtilityPicker, setShowUtilityPicker] = useState(false);
  const [colorMode, setColorMode] = useState('light'); // 'light' or 'dark'
  const [saturation, setSaturation] = useState(0); // Default saturation value
  const [loader, setLoader] = useState(true);
  const [primaryColorState, setPrimaryColorState] = useState({});
  const [secondaryColorState, setSecondaryColorState] = useState({});
  const [utilityColors, setUtilityColors] = useState({});
  const [neutralsColorState, setNeutralsColorState] = useState({});
  const [neutralsColorStateOrigin, setNeutralsColorStateOrigin] = useState({});
  const [defaultColors, setDefaultColors] = useState({});

  useEffect(() => {
    (async () => {
      const response = await fetch(
        '/settings/fabstir-default-color-customization.json',
      );
      const defaultColors = await response.json();
      setDefaultColors(defaultColors);
    })();
  }, []);

  useEffect(() => {
    if (userAuthPub) {
      fetchColor();
    } else {
      loadDefaultColors();
    }
  }, [userAuthPub]);

  const loadDefaultColors = async () => {
    try {
      await importColorCustomization(defaultColors);
      setPrimaryColorState(defaultColors.primaryColor);
      setSecondaryColorState(defaultColors.secondaryColor);
      setUtilityColors(defaultColors.utilityColors);
      setNeutralsColorState(defaultColors.neutralsColor);
      setNeutralsColorStateOrigin(defaultColors.neutralsColor);
    } catch (error) {
      console.error('Error loading default colors:', error);
    }
  };

  useEffect(() => {
    if (userAuthPub) {
      fetchColor();
    } else {
      // Function to set CSS variables
      const setCSSVariables = (colorObj, prefix = '') => {
        if (!colorObj) return;

        Object.keys(colorObj).forEach((key) => {
          const cssVariableName = `--${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          const cssValue = colorObj[key];
          // Set the CSS variable dynamically
          document.documentElement.style.setProperty(cssVariableName, cssValue);
        });
      };

      setCSSVariables(primaryColorState, '');
      setCSSVariables(secondaryColorState, '');
      setCSSVariables(utilityColors, '');
      setCSSVariables(neutralsColorState?.light, 'light-');
      setCSSVariables(neutralsColorState?.dark, 'dark-');
    }
  }, [userAuthPub]);

  // NeutralsColorChange function for Use Customize
  const handleNeutralsColorChange = (newColor, field) => {
    setSaturation(1);
    console.log(`${newColor} , ${field} color configured`);
    setNeutralsColorStateOrigin((prevState) => ({
      ...prevState,
      [colorMode]: {
        ...prevState[colorMode],
        //[field]: newColor.hex,
        [field]: newColor.hex,
      },
    }));

    setNeutralsColorState((prevState) => ({
      ...prevState,
      [colorMode]: {
        ...prevState[colorMode],
        //[field]: newColor.hex,
        [field]: newColor.hex,
      },
    }));
  };

  // NeutralsColorChange function for Use Customize
  const handleUtilityColorChange = (newColor, field) => {
    console.log(`${newColor} , ${field} color configured`);

    setUtilityColors((prevState) => ({
      ...prevState,
      [field]: newColor.hex,
    }));
  };

  // PrimaryColorChange function
  const handlePrimaryColorChange = (newColor) => {
    const updatedPrimaryColor = newColor.hex;
    const isLightColor = chroma(updatedPrimaryColor).luminance() > 0.5;

    setPrimaryColorState({
      primaryColor: updatedPrimaryColor,
      primaryContentColor: isLightColor
        ? chroma(updatedPrimaryColor).darken(2).hex()
        : chroma(updatedPrimaryColor).brighten(3).hex(),
      primaryLightColor: chroma(updatedPrimaryColor).brighten(1.5).hex(),
      primaryDarkColor: chroma(updatedPrimaryColor).darken(1).hex(),
    });

    setUtilityColors({
      successColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 120).darken(3).hex()
        : chroma(updatedPrimaryColor).set('hsl.h', 120).brighten(1).hex(),
      warningColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 60).darken(3).hex()
        : chroma(updatedPrimaryColor).set('hsl.h', 60).brighten(1).hex(),
      errorColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 0).darken(3).hex()
        : chroma(updatedPrimaryColor).set('hsl.h', 0).brighten(1).hex(),
      successContentColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 120).brighten(3).hex() // Darker in light mode
        : chroma(updatedPrimaryColor).set('hsl.h', 120).darken(2).hex(), // Less bright in dark mode
      warningContentColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 60).brighten(3).hex() // Darker in light mode
        : chroma(updatedPrimaryColor).set('hsl.h', 60).darken(2).hex(), // Less bright in dark mode
      errorContentColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 0).brighten(3).hex() // Darker in light mode
        : chroma(updatedPrimaryColor).set('hsl.h', 0).darken(2).hex(), // Less bright in dark mode
    });

    setSaturation(1);
    setNeutralsColorState({
      light: {
        foreground: blendWithPrimary(
          defaultColors.neutralsColor.light.foreground,
          2,
          updatedPrimaryColor,
        ),
        background: blendWithPrimary(
          defaultColors.neutralsColor.light.background,
          2,
          updatedPrimaryColor,
        ),
        border: blendWithPrimary(
          defaultColors.neutralsColor.light.border,
          2,
          updatedPrimaryColor,
        ),
        copy: blendWithPrimary(
          defaultColors.neutralsColor.light.copy,
          1,
          updatedPrimaryColor,
        ),
        copyLight: blendWithPrimary(
          defaultColors.neutralsColor.light.copyLight,
          2,
          updatedPrimaryColor,
        ),
        copyLighter: blendWithPrimary(
          defaultColors.neutralsColor.light.copyLighter,
          5,
          updatedPrimaryColor,
        ),
      },
      dark: {
        foreground: blendWithPrimary(
          defaultColors.neutralsColor.dark.foreground,
          2,
          updatedPrimaryColor,
        ),
        background: blendWithPrimary(
          defaultColors.neutralsColor.dark.background,
          2,
          updatedPrimaryColor,
        ),
        border: blendWithPrimary(
          defaultColors.neutralsColor.dark.border,
          2,
          updatedPrimaryColor,
        ),
        copy: blendWithPrimary(
          defaultColors.neutralsColor.dark.copy,
          1,
          updatedPrimaryColor,
        ),
        copyLight: blendWithPrimary(
          defaultColors.neutralsColor.dark.copyLight,
          2,
          updatedPrimaryColor,
        ),
        copyLighter: blendWithPrimary(
          defaultColors.neutralsColor.dark.copyLighter,
          5,
          updatedPrimaryColor,
        ),
      },
    });
    setNeutralsColorStateOrigin({
      light: {
        foreground: blendWithPrimary(
          defaultColors.neutralsColor.light.foreground,
          2,
          updatedPrimaryColor,
        ),
        background: blendWithPrimary(
          defaultColors.neutralsColor.light.background,
          2,
          updatedPrimaryColor,
        ),
        border: blendWithPrimary(
          defaultColors.neutralsColor.light.border,
          2,
          updatedPrimaryColor,
        ),
        copy: blendWithPrimary(
          defaultColors.neutralsColor.light.copy,
          1,
          updatedPrimaryColor,
        ),
        copyLight: blendWithPrimary(
          defaultColors.neutralsColor.light.copyLight,
          2,
          updatedPrimaryColor,
        ),
        copyLighter: blendWithPrimary(
          defaultColors.neutralsColor.light.copyLighter,
          5,
          updatedPrimaryColor,
        ),
      },
      dark: {
        foreground: blendWithPrimary(
          defaultColors.neutralsColor.dark.foreground,
          2,
          updatedPrimaryColor,
        ),
        background: blendWithPrimary(
          defaultColors.neutralsColor.dark.background,
          2,
          updatedPrimaryColor,
        ),
        border: blendWithPrimary(
          defaultColors.neutralsColor.dark.border,
          2,
          updatedPrimaryColor,
        ),
        copy: blendWithPrimary(
          defaultColors.neutralsColor.dark.copy,
          1,
          updatedPrimaryColor,
        ),
        copyLight: blendWithPrimary(
          defaultColors.neutralsColor.dark.copyLight,
          2,
          updatedPrimaryColor,
        ),
        copyLighter: blendWithPrimary(
          defaultColors.neutralsColor.dark.copyLighter,
          5,
          updatedPrimaryColor,
        ),
      },
    });
  };

  const handleSecondaryColorChange = (newColor) => {
    const updatedSecondaryColor = newColor.hex; // Use rgba format
    const isLightColor = chroma(updatedSecondaryColor).luminance() > 0.5;

    setSecondaryColorState({
      secondaryColor: updatedSecondaryColor,
      secondaryContentColor: isLightColor
        ? chroma(updatedSecondaryColor).darken(2).hex()
        : chroma(updatedSecondaryColor).brighten(3).hex(),
      secondaryLightColor: chroma(updatedSecondaryColor).brighten(1.5).hex(),
      secondaryDarkColor: chroma(updatedSecondaryColor).darken(1).hex(),
    });
  };

  const handleSaturation = (value) => {
    setSaturation(value);
    // if (value == 0) {
    //   setNeutralsColorState(defaultColors);
    // } else {
    setNeutralsColorState({
      light: {
        foreground: blendWithoutPrimary(
          neutralsColorStateOrigin.light.foreground,
          2,
        ),
        background: blendWithoutPrimary(
          neutralsColorStateOrigin.light.background,
          2,
        ),
        border: blendWithoutPrimary(neutralsColorStateOrigin.light.border, 2),
        copy: blendWithoutPrimary(neutralsColorStateOrigin.light.copy, 1),
        copyLight: blendWithoutPrimary(
          neutralsColorStateOrigin.light.copyLight,
          2,
        ),
        copyLighter: blendWithoutPrimary(
          neutralsColorStateOrigin.light.copyLighter,
          5,
        ),
      },
      dark: {
        foreground: blendWithoutPrimary(
          neutralsColorStateOrigin.dark.foreground,
          2,
        ),
        background: blendWithoutPrimary(
          neutralsColorStateOrigin.dark.background,
          2,
        ),
        border: blendWithoutPrimary(neutralsColorStateOrigin.dark.border, 2),
        copy: blendWithoutPrimary(neutralsColorStateOrigin.dark.copy, 1),
        copyLight: blendWithoutPrimary(
          neutralsColorStateOrigin.dark.copyLight,
          2,
        ),
        copyLighter: blendWithoutPrimary(
          neutralsColorStateOrigin.dark.copyLighter,
          5,
        ),
      },
    });
    //}
    console.log(saturation);
  };

  const blendWithoutPrimary = (color, amount) => {
    // Ensure 'color' is a valid chroma color
    const validColor = chroma(color);

    // Use the 'set' method to modify saturation directly
    // When saturation = 0, the color will be fully desaturated (grayscale)
    // When saturation = 1, the color will retain its original vibrancy
    const adjustedColor = validColor.set('hsl.s', saturation).hex();

    return adjustedColor;
  };

  const blendWithPrimary = (color, amount, primaryColor) => {
    return chroma
      .mix(color, primaryColor, 0.1)
      .saturate(saturation * amount) // Increase saturation
      .brighten(saturation / 10) // Lighten the color based on saturation level
      .hex(); // Return the hex value
    // return chroma
    // .saturate(color, saturation * amount) // Increase saturation only for the color
    // .brighten(saturation / 10) // Lighten the color based on saturation level
    // .hex(); // Return the hex value
  };

  const handleExport = () => {
    exportColorCustomization();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const json = JSON.parse(e.target.result);
        await importColorCustomization(json);
        fetchColor();
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = async () => {
    try {
      toast.dismiss();
      const data = {
        primaryColor: primaryColorState,
        secondaryColor: secondaryColorState,
        utilityColors: utilityColors,
        neutralsColor: neutralsColorState,
        saturationNumber: saturation,
      };
      await saveColorCustomization(data);
      toast.success('Color saved successfully');
      fetchColor();
    } catch (error) {
      console.error('Error in onSubmit:', error);
    }
  };

  const handleError = (error) => {
    if (error?.response?.data?.err === 'Invalid token.') {
      handleLogout();
    }
    console.error(
      'Error:',
      error.response?.data || error.request || error.message,
    );
  };

  const handleLogout = async () => {
    await signOut();
    setSmartAccount(null);
    setConnectedChainId(null);
    router.push('/');
  };

  const fetchColor = async () => {
    setLoader(true);
    try {
      const colors = await loadColorCustomization(userAuthPub);
      const {
        primaryColor,
        secondaryColor,
        utilityColors,
        neutralsColor,
        saturationNumber,
      } = colors ?? {};

      // Function to set CSS variables
      const setCSSVariables = (colorObj, prefix = '') => {
        if (!colorObj) return;

        Object.keys(colorObj).forEach((key) => {
          const cssVariableName = `--${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          const cssValue = colorObj[key];
          // Set the CSS variable dynamically
          document.documentElement.style.setProperty(cssVariableName, cssValue);
        });
      };

      // Set CSS variables for colors
      setCSSVariables(primaryColor, '');
      setCSSVariables(secondaryColor, '');
      setCSSVariables(utilityColors, '');
      setCSSVariables(neutralsColor?.light, 'light-');
      setCSSVariables(neutralsColor?.dark, 'dark-');

      // Save colors to state
      setPrimaryColorState(primaryColor);
      setSecondaryColorState(secondaryColor);
      setUtilityColors(utilityColors);
      setNeutralsColorState(neutralsColor);
      setNeutralsColorStateOrigin(neutralsColor);
      setSaturation(saturationNumber);
    } catch (error) {
      handleError(error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="bg-background dark:bg-dark-background text-copy dark:text-dark-copy">
      {loader ? (
        <Loader />
      ) : (
        <div className="mx-auto w-3/5 pt-5">
          <div className="flex relative mb-10 ">
            <div
              className="flex justify-start ml-4 absolute left-0 bg-primary text-primary-content hover:bg-primary-light 
        active:bg-primary-dark focus:ring-2 focus:ring-primary-dark 
        disabled:bg-primary-light/50 shadow-md p-2 rounded-md"
            >
              <TextLink className="no-underline	" href="/">
                <div className="flex items-center">
                  <ChevronDoubleLeftIcon
                    className="h-4 w-4 font-bold mr-1 "
                    aria-hidden="true"
                  />
                  <span className="">Back</span>
                </div>
              </TextLink>
            </div>
          </div>
          <div className="mb-8 md:mb-12 text-center ">
            <h1 className="mb-4 text-4xl font-bold leading-[1.2] md:text-5xl md:leading-[1.2]">
              Color Customization
            </h1>
            <p className="mb-4 max-w-3xl mx-auto text-lg">
              Find or add your primary brand color, adjust a couple of nobs, and
              create a sensible, semantic, professional color palette in a
              couple of seconds.
            </p>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
            <div>
              <div className="mb-4">
                <h2 className="mb-2 text-3xl font-bold">Primary</h2>
                <p className="text-sm ">
                  Primary brand color, used for main call to actions, logos,
                  etc.
                </p>
              </div>
              <div className="relative mb-4">
                <Button
                  className="flex w-full items-center rounded-full p-1 shadow-xl transition-colors"
                  onClick={() => setShowPicker(!showPicker)}
                  style={{
                    color: primaryColorState?.primaryContentColor,
                    border: '2px solid rgb(194, 215, 235)',
                    background: primaryColorState?.primaryColor,
                  }}
                >
                  Select Primary Color
                </Button>
                <div
                  className="grid h-8 w-8 place-content-center rounded-full"
                  style={{
                    color: primaryColorState?.primaryColor,
                    background: primaryColorState?.primaryContentColor,
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    height="1em"
                    width="1em"
                  >
                    <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
                  </svg>
                </div>
                <span className="w-full text-center">
                  {primaryColorState?.primaryColor}
                </span>

                {showPicker && (
                  <div className="absolute mt-2 z-10">
                    <ChromePicker
                      color={primaryColorState?.primaryColor}
                      onChange={handlePrimaryColorChange}
                      disableAlpha={true}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <div>
                  <div
                    className="mb-2 w-full rounded-xl shadow-md transition-colors"
                    style={{
                      background: primaryColorState?.primaryColor,
                      height: '10rem',
                    }}
                  ></div>
                  <p className="-mb-1 ml-1 text-lg font-semibold">Primary</p>
                  <span className="ml-1 text-sm ">
                    {primaryColorState?.primaryColor}
                  </span>
                </div>
              </div>
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: primaryColorState?.primaryContentColor,
                    height: '5rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">
                  Primary Content
                </p>
                <span className="ml-1 text-sm ">
                  {primaryColorState?.primaryContentColor}
                </span>
              </div>
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: primaryColorState?.primaryLightColor,
                    height: '5rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">
                  Primary Light
                </p>
                <span className="ml-1 text-sm ">
                  {primaryColorState?.primaryLightColor}
                </span>
              </div>
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: primaryColorState?.primaryDarkColor,
                    height: '5rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">Primary Dark</p>
                <span className="ml-1 text-sm ">
                  {primaryColorState?.primaryDarkColor}
                </span>
              </div>
            </div>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
            <div className="mb-4">
              <div className="mb-4">
                <h2 className="mb-2 text-3xl font-bold">Secondary</h2>
                <p className="text-sm ">
                  Secondary brand color, used for tertiary actions.
                </p>
              </div>
              {/* <div
                style={{
                  color: secondaryColorState?.secondaryContentColor,
                  border: '2px solid rgb(214, 194, 235)',
                  background: secondaryColorState?.secondaryColor,
                }}
                className="flex w-full items-center gap-4 rounded-full p-1 shadow-xl transition-colors "
              >
                <label
                  for="rotation-input"
                  className="grid h-8 w-8 shrink-0 place-content-center rounded-full"
                  style={{
                    color: secondaryColorState?.secondaryColor,
                    background: secondaryColorState?.secondaryContentColor,
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    height="1em"
                    width="1em"
                  >
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </label>
                <DebounceInput
                  id="rotation-input"
                  debounceTimeout={250}
                  className="hide-arrows mr-0.5 block w-full bg-transparent focus:outline-0"
                  value={hueRotation || ''}
                  onChange={(e) => handleHueRotation(e.target.value)}
                />

                <label
                  for="rotation-input"
                  className="mr-4 whitespace-nowrap text-xs font-bold"
                >
                  hue degrees
                </label>
              </div> */}
              <div className="relative mb-4">
                <Button
                  className="flex w-full items-center rounded-full p-1 shadow-xl transition-colors"
                  onClick={() => setShowPickerSecondary(!showPickerSecondary)}
                  style={{
                    color: secondaryColorState?.secondaryContentColor,
                    border: '2px solid rgb(194, 215, 235)',
                    background: secondaryColorState?.secondaryColor,
                  }}
                >
                  Select Secondary Color
                </Button>
                <div
                  className="grid h-8 w-8 place-content-center rounded-full"
                  style={{
                    color: secondaryColorState?.secondaryColor,
                    background: secondaryColorState?.secondaryContentColor,
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    height="1em"
                    width="1em"
                  >
                    <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
                  </svg>
                </div>
                <span className="w-full text-center">
                  {secondaryColorState?.secondaryColor}
                </span>

                {showPickerSecondary && (
                  <div className="absolute mt-2 z-10">
                    <ChromePicker
                      color={secondaryColorState?.secondaryColor}
                      onChange={handleSecondaryColorChange}
                      disableAlpha={true}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <div>
                  <div
                    className="mb-2 w-full rounded-xl shadow-md transition-colors"
                    style={{
                      background: secondaryColorState?.secondaryColor,
                      height: '10rem',
                    }}
                  ></div>
                  <p className="-mb-1 ml-1 text-lg font-semibold">Secondary</p>
                  <span className="ml-1 text-sm ">
                    {secondaryColorState?.secondaryColor}
                  </span>
                </div>
              </div>
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: secondaryColorState?.secondaryContentColor,
                    height: '5rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">
                  Secondary Content
                </p>
                <span className="ml-1 text-sm ">
                  {secondaryColorState?.secondaryContentColor}
                </span>
              </div>
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: secondaryColorState?.secondaryLightColor,
                    height: '5rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">
                  Secondary Light
                </p>
                <span className="ml-1 text-sm ">
                  {secondaryColorState?.secondaryLightColor}
                </span>
              </div>
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: secondaryColorState?.secondaryDarkColor,
                    height: '5rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">
                  Secondary Dark
                </p>
                <span className="ml-1 text-sm ">
                  {secondaryColorState?.secondaryDarkColor}
                </span>
              </div>
            </div>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
            <div>
              <div className="mb-4">
                <h2 className="mb-2 text-3xl font-bold">Neutrals</h2>
                <p className="text-sm ">
                  Base colors are for backgrounds and borders. Copy colors are
                  for text.
                </p>
              </div>
              <div className="mb-4 w-full">
                <label
                  htmlFor="base-palette-saturation"
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <span className="">Less</span>
                  <span>Saturation</span>
                  <span className="">More</span>
                </label>
                <div className="w-full px-0">
                  <Input
                    type="range"
                    id="base-palette-saturation"
                    min="0"
                    max="1"
                    step=".05"
                    className="w-full"
                    padding="px-0"
                    value={saturation}
                    onChange={(e) =>
                      handleSaturation(parseFloat(e.target.value))
                    } // Ensure value is parsed as float
                  />
                </div>
              </div>
              <div
                style={{
                  background: colorMode === 'dark' ? '#191818' : '#faf5f5', // Dark background for dark mode, light green for light mode
                }}
                className="relative flex w-full items-center rounded-full p-1 shadow-xl transition-colors"
              >
                <div
                  className="text-sm font-medium flex items-center justify-center gap-2 p-2 transition-colors w-full relative z-10 rounded-full text-black bg-white cursor-pointer"
                  onClick={() => {
                    setColorMode('light');
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 md:text-sm"
                    height="1em"
                    width="1em"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span className="relative z-10 text-black">Light</span>
                </div>

                <div
                  className="text-sm font-medium flex items-center justify-center gap-2 p-2 transition-colors w-full relative z-10 rounded-full text-white bg-black cursor-pointer"
                  onClick={() => {
                    setColorMode('dark');
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 md:text-sm"
                    height="1em"
                    width="1em"
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span className="relative z-10 text-white">Dark</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                'foreground',
                'background',
                'border',
                'copy',
                'copyLight',
                'copyLighter',
              ].map((field) => (
                <div key={field}>
                  <div
                    className="mb-2 w-full rounded-xl shadow-md transition-colors cursor-pointer relative group"
                    style={{
                      background:
                        colorMode === 'dark'
                          ? neutralsColorState?.dark?.[field]
                          : neutralsColorState?.light?.[field], // Assuming light mode for simplicity
                      height: '5rem',
                      position: 'relative', // Ensure the button has relative positioning
                    }}
                    onClick={() =>
                      setShowNeutralPicker((prev) => ({
                        ...prev,
                        [field]: !prev[field],
                      }))
                    }
                  >
                    {/* SVG Icon - hidden initially, appears on hover */}
                    <svg
                      className="absolute top-1 left-1 text-gray-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      height="1.5em"
                      width="1.5em"
                    >
                      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
                    </svg>
                  </div>
                  <p className="-mb-1 ml-1 text-lg font-semibold">
                    {field.charAt(0).toUpperCase() + field.slice(1)}{' '}
                    {/* Capitalize */}
                  </p>
                  <span className="ml-1 text-sm ">
                    {colorMode === 'dark'
                      ? neutralsColorState?.dark?.[field]
                      : neutralsColorState?.light?.[field]}
                  </span>

                  {/* Show color picker */}
                  {showNeutralPicker[field] && (
                    <ChromePicker
                      color={
                        colorMode === 'dark'
                          ? neutralsColorState?.dark?.[field]
                          : neutralsColorState?.light?.[field]
                      }
                      onChange={(color) =>
                        handleNeutralsColorChange(color, field)
                      }
                      disableAlpha={true}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
            <div>
              <div className="mb-4">
                <h2 className="mb-2 text-3xl font-bold">Utility</h2>
                <p className="text-sm ">
                  Utility colors denote intention, such as deleting an account.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                'successColor',
                'warningColor',
                'errorColor',
                'successContentColor',
                'warningContentColor',
                'errorContentColor',
              ].map((field) => (
                <div key={field}>
                  <div
                    className="mb-2 w-full rounded-xl shadow-md transition-colors cursor-pointer relative group"
                    style={{
                      background: utilityColors?.[field], // Assuming light mode for simplicity
                      height: '5rem',
                    }}
                    onClick={() =>
                      setShowUtilityPicker((prev) => ({
                        ...prev,
                        [field]: !prev[field],
                      }))
                    }
                  >
                    {/* SVG Icon - hidden initially, appears on hover */}
                    <svg
                      className="absolute top-1 left-1 text-gray-500 transition-opacity opacity-0 group-hover:opacity-100"
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      height="1.5em"
                      width="1.5em"
                    >
                      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
                    </svg>
                  </div>
                  <p className="-mb-1 ml-1 text-lg font-semibold">
                    {field.charAt(0).toUpperCase() + field.slice(1)}{' '}
                    {/* Capitalize */}
                  </p>
                  <span className="ml-1 text-sm ">
                    {utilityColors?.[field]}
                  </span>

                  {/* Show color picker */}
                  {showUtilityPicker[field] && (
                    <ChromePicker
                      color={utilityColors?.[field]}
                      onChange={(color) =>
                        handleUtilityColorChange(color, field)
                      }
                      disableAlpha={true}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full text-right py-5 border-t-2 border-slate-200 flex justify-end space-x-4">
            <input
              type="file"
              id="import-file"
              className="hidden"
              onChange={handleImport}
            />
            <label
              htmlFor="import-file"
              className="bg-primary text-primary-content hover:bg-primary-light 
          active:bg-primary-dark focus:ring-2 focus:ring-primary-dark 
          disabled:bg-primary-light/50 shadow-md rounded px-4 py-3 text-lg font-medium cursor-pointer"
            >
              Import
            </label>
            <Button
              className="bg-primary text-primary-content hover:bg-primary-light 
          active:bg-primary-dark focus:ring-2 focus:ring-primary-dark 
          disabled:bg-primary-light/50 shadow-md rounded px-4 py-3 text-lg font-medium"
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              className="bg-primary text-primary-content hover:bg-primary-light 
          active:bg-primary-dark focus:ring-2 focus:ring-primary-dark 
          disabled:bg-primary-light/50 shadow-md rounded px-4 py-3 text-lg font-medium"
              onClick={onSubmit}
            >
              Save Changes
            </Button>
          </div>{' '}
        </div>
      )}
    </div>
  );
};

export default Color;
