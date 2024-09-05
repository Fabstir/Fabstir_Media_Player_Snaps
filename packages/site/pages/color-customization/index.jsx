import React, { useState, useEffect, useContext } from 'react';
import { getSmartAccountAddress } from '../../src/blockchain/useAccountAbstractionPayment';
import useCreateUser from '../../src/hooks/useCreateUser';
import BlockchainContext from '../../state/BlockchainContext';
import { DebounceInput } from 'react-debounce-input';
import { ChromePicker } from 'react-color';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import chroma from 'chroma-js';
import axios from 'axios';
import { TextLink } from '../../src/ui-components/text';
import { ChevronDoubleLeftIcon } from 'heroiconsv1/solid';

let url = process.env.NEXT_PUBLIC_FABSTIRDB_BACKEND_URL || '';

const defaultColors = {
  light: {
    foreground: '#fbfbfb',
    background: '#f0f0f0',
    border: '#dfdfdf',
    copy: '#262626',
    copyLight: '#666666',
    copyLighter: '#8c8c8c',
  },
  dark: {
    foreground: '#262626',
    background: '#1a1a1a',
    border: '#404040',
    copy: '#fbfbfb',
    copyLight: '#d9d9d9',
    copyLighter: '#a6a6a6',
  },
};

const Color = () => {
  const router = useRouter();
  const blockchainContext = useContext(BlockchainContext);
  const { smartAccount, setSmartAccount, setConnectedChainId } =
    blockchainContext;
  const { signOut } = useCreateUser();
  const [smartAccountAddress, setSmartAccountAddress] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [colorMode, setColorMode] = useState('light'); // 'light' or 'dark'
  const [saturation, setSaturation] = useState(0); // Default saturation value
  const [hueRotation, setHueRotation] = useState(90);
  const [primaryColorState, setPrimaryColorState] = useState({
    primaryColor: '#c2d7eb',
    primaryContentColor: chroma('#c2d7eb').brighten(3).hex(),
    primaryLightColor: chroma('#c2d7eb').brighten(1).hex(),
    primaryDarkColor: chroma('#c2d7eb').darken(1).hex(),
  });
  const [secondaryColorState, setSecondaryColorState] = useState({
    secondaryColor: chroma('#c2d7eb').set('hsl.h', `+${hueRotation}`).hex(),
    secondaryContentColor: chroma('#c2d7eb').darken(2).hex(),
    secondaryLightColor: chroma('#c2d7eb').brighten(1.5).hex(),
    secondaryDarkColor: chroma('#c2d7eb').darken(1).hex(),
  });
  const [utilityColors, setUtilityColors] = useState({
    successColor: chroma(primaryColorState.primaryColor).brighten(1.5).hex(), // Lighten primary color for success
    warningColor: chroma(primaryColorState.primaryColor)
      .set('hsl.h', `+30`)
      .hex(), // Adjust hue for warning
    errorColor: chroma(primaryColorState.primaryColor)
      .set('hsl.h', `-30`)
      .hex(), // Adjust hue for error
    successContentColor: chroma(primaryColorState.primaryColor).darken(2).hex(),
    warningContentColor: chroma(primaryColorState.primaryColor).darken(2).hex(),
    errorContentColor: chroma(primaryColorState.primaryColor).darken(2).hex(),
  });
  const [neutralsColorState, setNeutralsColorState] = useState(defaultColors);

  const handleButtonClick = () => {
    setShowPicker(!showPicker);
  };

  useEffect(() => {
    const setSmartAccountAddressFn = async () => {
      if (smartAccount) {
        setSmartAccountAddress(await getSmartAccountAddress(smartAccount));
      } else {
        handleLogout();
      }
    };
    setSmartAccountAddressFn();
  }, [smartAccount]);

  const handleColorChange = (newColor) => {
    const updatedPrimaryColor = newColor.hex;
    const updatedSecondaryColor = chroma(newColor.hex)
      .set('hsl.h', `+${hueRotation}`)
      .hex();

    const isLightColor = chroma(updatedPrimaryColor).luminance() > 0.5;

    setPrimaryColorState({
      primaryColor: updatedPrimaryColor,
      primaryContentColor: isLightColor
        ? chroma(updatedPrimaryColor).darken(2).hex()
        : chroma(updatedPrimaryColor).brighten(3).hex(),
      primaryLightColor: chroma(updatedPrimaryColor).brighten(1.5).hex(),
      primaryDarkColor: chroma(updatedPrimaryColor).darken(1).hex(),
    });

    setSecondaryColorState({
      secondaryColor: updatedSecondaryColor,
      secondaryContentColor: isLightColor
        ? chroma(updatedSecondaryColor).darken(2).hex()
        : chroma(updatedSecondaryColor).brighten(3).hex(),
      secondaryLightColor: chroma(updatedSecondaryColor).brighten(1.5).hex(),
      secondaryDarkColor: chroma(updatedSecondaryColor).darken(1).hex(),
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
          ? chroma(updatedPrimaryColor).set('hsl.h', 120).brighten(3).hex()  // Darker in light mode
          : chroma(updatedPrimaryColor).set('hsl.h', 120).darken(2).hex(), // Less bright in dark mode
        warningContentColor: isLightColor
          ? chroma(updatedPrimaryColor).set('hsl.h', 60).brighten(3).hex()  // Darker in light mode
          : chroma(updatedPrimaryColor).set('hsl.h', 60).darken(2).hex(), // Less bright in dark mode
        errorContentColor: isLightColor
          ? chroma(updatedPrimaryColor).set('hsl.h', 0).brighten(3).hex()  // Darker in light mode
          : chroma(updatedPrimaryColor).set('hsl.h', 0).darken(2).hex(), // Less bright in dark mode
      });

    setNeutralsColorState({
      light: {
        foreground: blendWithPrimary(defaultColors.light.foreground),
        background: blendWithPrimary(defaultColors.light.background),
        border: blendWithPrimary(defaultColors.light.border),
        copy: blendWithPrimary(defaultColors.light.copy),
        copyLight: blendWithPrimary(defaultColors.light.copyLight),
        copyLighter: blendWithPrimary(defaultColors.light.copyLighter),
      },
      dark: {
        foreground: blendWithPrimary(defaultColors.dark.foreground),
        background: blendWithPrimary(defaultColors.dark.background),
        border: blendWithPrimary(defaultColors.dark.border),
        copy: blendWithPrimary(defaultColors.dark.copy),
        copyLight: blendWithPrimary(defaultColors.dark.copyLight),
        copyLighter: blendWithPrimary(defaultColors.dark.copyLighter),
      },
    });
  };

  const handleHueRotation = (value) => {
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      setHueRotation(parsedValue);

      const updatedSecondaryColor = chroma(primaryColorState?.primaryColor)
        .set('hsl.h', `+${parsedValue}`)
        .hex();

      const isLightColor =
        chroma(primaryColorState?.primaryColor).luminance() > 0.5;

      setSecondaryColorState({
        secondaryColor: updatedSecondaryColor,
        secondaryContentColor: isLightColor
          ? chroma(updatedSecondaryColor).darken(2).hex()
          : chroma(updatedSecondaryColor).brighten(2).hex(),
        secondaryLightColor: chroma(updatedSecondaryColor).brighten(1.5).hex(),
        secondaryDarkColor: chroma(updatedSecondaryColor).darken(1).hex(),
      });
    }
  };

  const handleSaturation = (value) => {
    setSaturation(value);

    setNeutralsColorState({
      light: {
        foreground: blendWithPrimary(defaultColors.light.foreground),
        background: blendWithPrimary(defaultColors.light.background),
        border: blendWithPrimary(defaultColors.light.border),
        copy: blendWithPrimary(defaultColors.light.copy),
        copyLight: blendWithPrimary(defaultColors.light.copyLight),
        copyLighter: blendWithPrimary(defaultColors.light.copyLighter),
      },
      dark: {
        foreground: blendWithPrimary(defaultColors.dark.foreground),
        background: blendWithPrimary(defaultColors.dark.background),
        border: blendWithPrimary(defaultColors.dark.border),
        copy: blendWithPrimary(defaultColors.dark.copy),
        copyLight: blendWithPrimary(defaultColors.dark.copyLight),
        copyLighter: blendWithPrimary(defaultColors.dark.copyLighter),
      },
    });
  };

  const blendWithPrimary = (color) => {
    return chroma
      .mix(color, primaryColorState.primaryColor, 0.1)
      .saturate(saturation)
      .hex();
  };

  const onSubmit = async () => {
    try {
      toast.dismiss();
      let data = {};
      data.smartAccount = smartAccountAddress;
      data.primaryColor = primaryColorState;
      data.secondaryColor = secondaryColorState;
      data.utilityColors = utilityColors;
      data.neutralsColor = neutralsColorState;
      const userData = sessionStorage.getItem('userSession');
      const token = JSON.parse(userData)?.token ?? '';
      console.log('data', data);
      await axios.post(`${url}/color`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Color saved successfully');
      fetchColor();
    } catch (error) {
      handleError(error);
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

  useEffect(() => {
    if (smartAccountAddress) {
      fetchColor();
    }
  }, [smartAccountAddress]);

  const fetchColor = async () => {
    const userData = sessionStorage.getItem('userSession');
    const token = JSON.parse(userData)?.token ?? '';
    try {
      if (!token || !smartAccountAddress) return;
      const response = await axios.get(`${url}/color/${smartAccountAddress}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const { primaryColor, secondaryColor, utilityColors, neutralsColor } =
        response.data.document[0] ?? {};

      const setCSSVariables = (colorObj, prefix = '') => {
        if (!colorObj) return;

        Object.keys(colorObj).forEach((key) => {
          document.documentElement.style.setProperty(
            `--${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            colorObj[key],
          );
          console.log(
            'color:',
            `--${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
          );
        });
      };
      // Setting the primary colors
      setCSSVariables(primaryColor, '');

      // Setting the secondary colors
      setCSSVariables(secondaryColor, '');

      // Setting the utility colors (e.g., success, warning, error)
      setCSSVariables(utilityColors, '');

      // Setting the neutral colors for light and dark modes
      setCSSVariables(neutralsColor.light, 'light-');
      setCSSVariables(neutralsColor.dark, 'dark-');

      // Save to state
      setPrimaryColorState(primaryColor);
      setSecondaryColorState(secondaryColor);
      setUtilityColors(utilityColors);
      setNeutralsColorState(neutralsColor);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="bg-background dark:bg-dark-background text-copy dark:text-dark-copy">
      <div className="mx-auto w-3/5 pt-5">
        <div className="flex relative mb-10 ">
          <div className="flex justify-start ml-4 absolute left-0 bg-primary text-primary-content p-2 rounded-md">
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
            create a sensible, semantic, professional color palette in a couple
            of seconds.
          </p>
        </div>
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
          <div>
            <div className="mb-4">
              <h2 className="mb-2 text-3xl font-bold">Primary</h2>
              <p className="text-sm ">
                Primary brand color, used for main call to actions, logos, etc.
              </p>
            </div>
            <div className="relative mb-4">
              <button
                className="flex w-full items-center rounded-full p-1 shadow-xl transition-colors"
                onClick={handleButtonClick}
                style={{
                  color: primaryColorState.primaryContentColor,
                  border: '2px solid rgb(194, 215, 235)',
                  background: primaryColorState.primaryColor,
                }}
                aria-label="Select Primary Color"
              >
                <div
                  className="grid h-8 w-8 place-content-center rounded-full"
                  style={{
                    color: primaryColorState.primaryColor,
                    background: primaryColorState.primaryContentColor,
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
                  {primaryColorState.primaryColor}
                </span>
              </button>

              {showPicker && (
                <div className="absolute mt-2 z-10">
                  <ChromePicker
                    color={primaryColorState.primaryColor}
                    onChange={handleColorChange}
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
                    background: primaryColorState.primaryColor,
                    height: '10rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">Primary</p>
                <span className="ml-1 text-sm ">
                  {primaryColorState.primaryColor}
                </span>
              </div>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: primaryColorState.primaryContentColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">
                Primary Content
              </p>
              <span className="ml-1 text-sm ">
                {primaryColorState.primaryContentColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: primaryColorState.primaryLightColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Primary Light</p>
              <span className="ml-1 text-sm ">
                {primaryColorState.primaryLightColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: primaryColorState.primaryDarkColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Primary Dark</p>
              <span className="ml-1 text-sm ">
                {primaryColorState.primaryDarkColor}
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
            <div
              style={{
                color: secondaryColorState.secondaryContentColor,
                border: '2px solid rgb(214, 194, 235)',
                background: secondaryColorState.secondaryColor,
              }}
              className="flex w-full items-center gap-4 rounded-full p-1 shadow-xl transition-colors "
            >
              <label
                for="rotation-input"
                className="grid h-8 w-8 shrink-0 place-content-center rounded-full"
                style={{
                  color: secondaryColorState.secondaryColor,
                  background: secondaryColorState.secondaryContentColor,
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
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3">
              <div>
                <div
                  className="mb-2 w-full rounded-xl shadow-md transition-colors"
                  style={{
                    background: secondaryColorState.secondaryColor,
                    height: '10rem',
                  }}
                ></div>
                <p className="-mb-1 ml-1 text-lg font-semibold">Secondary</p>
                <span className="ml-1 text-sm ">
                  {secondaryColorState.secondaryColor}
                </span>
              </div>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: secondaryColorState.secondaryContentColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">
                Secondary Content
              </p>
              <span className="ml-1 text-sm ">
                {secondaryColorState.secondaryContentColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: secondaryColorState.secondaryLightColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">
                Secondary Light
              </p>
              <span className="ml-1 text-sm ">
                {secondaryColorState.secondaryLightColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: secondaryColorState.secondaryDarkColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Secondary Dark</p>
              <span className="ml-1 text-sm ">
                {secondaryColorState.secondaryDarkColor}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
          <div>
            <div className="mb-4">
              <h2 className="mb-2 text-3xl font-bold">Neutrals</h2>
              <p className="text-sm ">
                Base colors are for backgrounds and borders. Copy colors are for
                text.
              </p>
            </div>
            <div className="mb-4 w-full">
              <label
                htmlFor="base-palette-saturation"
                className="flex items-center justify-between text-xs font-semibold"
              >
                <span className="">Less</span>
                <span style={{ color: 'rgb(41, 64, 86)' }}>Saturation</span>
                <span className="">More</span>
              </label>
              <input
                type="range"
                id="base-palette-saturation"
                min="0"
                max="0.35"
                step=".025"
                className="w-full"
                value={saturation}
                onChange={(e) => handleSaturation(e.target.value)}
              />
            </div>
            <div
              style={{
                background: colorMode === 'dark' ? '#262626' : '#fafbfd',
              }}
              className="relative flex w-full items-center rounded-full p-1 shadow-xl transition-colors"
            >
              <button
                className="text-sm font-medium flex items-center justify-center gap-2 p-2 transition-colors w-full relative z-10 rounded-full"
                style={{
                  color: '#fafbfd',
                  background: colorMode === 'dark' ? '#262626' : '#262626',
                }}
                onClick={() => setColorMode('light')}
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
                <span className="relative z-10">Light</span>
              </button>
              <button
                className="text-sm font-medium flex items-center justify-center gap-2 p-2 transition-colors w-full relative z-10 rounded-full"
                style={{
                  color: '#262626',
                  background: colorMode === 'dark' ? '#fafbfd' : '#fafbfd',
                }}
                onClick={() => setColorMode('dark')}
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
                <span className="relative z-10">Dark</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: neutralsColorState[colorMode].foreground,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Foreground</p>
              <span className="ml-1 text-sm ">
                {neutralsColorState[colorMode].foreground}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: neutralsColorState[colorMode].background,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Background</p>
              <span className="ml-1 text-sm ">
                {neutralsColorState[colorMode].background}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: neutralsColorState[colorMode].border,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Border</p>
              <span className="ml-1 text-sm ">
                {neutralsColorState[colorMode].border}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: neutralsColorState[colorMode].copy,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Copy</p>
              <span className="ml-1 text-sm ">
                {neutralsColorState[colorMode].copy}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: neutralsColorState[colorMode].copyLight,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Copy Light</p>
              <span className="ml-1 text-sm ">
                {neutralsColorState[colorMode].copyLight}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: neutralsColorState[colorMode].copyLighter,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Copy Lighter</p>
              <span className="ml-1 text-sm ">
                {neutralsColorState[colorMode].copyLighter}
              </span>
            </div>
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
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: utilityColors.successColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Success</p>
              <span className="ml-1 text-sm ">
                {utilityColors.successColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: utilityColors.warningColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Warning</p>
              <span className="ml-1 text-sm ">
                {utilityColors.warningColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{ background: utilityColors.errorColor, height: '5rem' }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Error</p>
              <span className="ml-1 text-sm ">{utilityColors.errorColor}</span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: utilityColors.successContentColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">
                Success Content
              </p>
              <span className="ml-1 text-sm ">
                {utilityColors.successContentColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: utilityColors.warningContentColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">
                Warning Content
              </p>
              <span className="ml-1 text-sm ">
                {utilityColors.warningContentColor}
              </span>
            </div>
            <div>
              <div
                className="mb-2 w-full rounded-xl shadow-md transition-colors"
                style={{
                  background: utilityColors.errorContentColor,
                  height: '5rem',
                }}
              ></div>
              <p className="-mb-1 ml-1 text-lg font-semibold">Error Content</p>
              <span className="ml-1 text-sm ">
                {utilityColors.errorContentColor}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full text-right py-5 border-t-2 border-slate-200">
          <button
            className=" bg-primary rounded px-4 py-3 text-primary-content text-lg font-medium"
            onClick={() => onSubmit()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Color;
