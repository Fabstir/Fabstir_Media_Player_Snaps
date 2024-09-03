import React, { useState, useEffect } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { ChromePicker } from 'react-color';
import chroma from 'chroma-js';

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
        : chroma(updatedPrimaryColor).brighten(2).hex(),
      primaryLightColor: chroma(updatedPrimaryColor).brighten(1.5).hex(),
      primaryDarkColor: chroma(updatedPrimaryColor).darken(1).hex(),
    });

    setSecondaryColorState({
      secondaryColor: updatedSecondaryColor,
      secondaryContentColor: isLightColor
        ? chroma(updatedSecondaryColor).darken(2).hex()
        : chroma(updatedSecondaryColor).brighten(2).hex(),
      secondaryLightColor: chroma(updatedSecondaryColor).brighten(1.5).hex(),
      secondaryDarkColor: chroma(updatedSecondaryColor).darken(1).hex(),
    });

    setUtilityColors({
      successColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 120).darken(1).hex()
        : chroma(updatedPrimaryColor).set('hsl.h', 120).brighten(1).hex(),
      warningColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 60).darken(2).hex()
        : chroma(updatedPrimaryColor).set('hsl.h', 60).brighten(2).hex(),
      errorColor: isLightColor
        ? chroma(updatedPrimaryColor).set('hsl.h', 0).darken(1).hex()
        : chroma(updatedPrimaryColor).set('hsl.h', 0).brighten(1).hex(),
      successContentColor: chroma(updatedPrimaryColor)
        .set('hsl.h', 120)
        .brighten(1.5)
        .hex(),
      warningContentColor: chroma(updatedPrimaryColor)
        .set('hsl.h', 60)
        .brighten(1.5)
        .hex(),
      errorContentColor: chroma(updatedPrimaryColor)
        .set('hsl.h', 0)
        .darken(1.5)
        .hex(),
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

  const adjustColorSaturation = (color, amount) => {
    return chroma(color).saturate(amount).hex();
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
    return chroma.mix(color, primaryColorState.primaryColor, 0.1).saturate(saturation).hex();
  };

  return (
    <div className="mx-auto w-3/5">
      <div className="mb-12 md:mb-24">
        <h1 className="mb-4 max-w-2xl text-4xl font-black leading-[1.2] md:text-5xl md:leading-[1.2]">
          A CSS Color Palette Generator That Works
        </h1>
        <p className="mb-4 max-w-xl text-lg text-neutral-700">
          Find or add your primary brand color, adjust a couple of nobs, and
          create a sensible, semantic, professional color palette in a couple of
          seconds. Preview on a real site. Export to CSS, SCSS, Figma, and
          TailwindCSS.
        </p>
      </div>
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
        <div>
          <div className="mb-4">
            <h2 className="mb-2 text-3xl font-bold">Primary</h2>
            <p className="text-sm text-neutral-600">
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
              <span className="ml-1 text-sm text-neutral-700">
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
            <p className="-mb-1 ml-1 text-lg font-semibold">Primary Content</p>
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
              {primaryColorState.primaryDarkColor}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
        <div className="mb-4">
          <div className="mb-4">
            <h2 className="mb-2 text-3xl font-bold">Secondary</h2>
            <p className="text-sm text-neutral-600">
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
              <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <p className="-mb-1 ml-1 text-lg font-semibold">Secondary Light</p>
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
              {secondaryColorState.secondaryDarkColor}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
        <div>
          <div className="mb-4">
            <h2 className="mb-2 text-3xl font-bold">Neutrals</h2>
            <p className="text-sm text-neutral-600">
              Base colors are for backgrounds and borders. Copy colors are for
              text.
            </p>
          </div>
          <div className="mb-4 w-full">
            <label
              htmlFor="base-palette-saturation"
              className="flex items-center justify-between text-xs font-semibold"
            >
              <span className="text-neutral-700">Less</span>
              <span style={{ color: 'rgb(41, 64, 86)' }}>Saturation</span>
              <span className="text-neutral-700">More</span>
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
            style={{ background: colorMode === 'dark' ? '#262626' : '#fafbfd' }}
            className="relative flex w-full items-center rounded-full p-1 shadow-xl transition-colors"
          >
            <button
              className="text-sm font-medium flex items-center justify-center gap-2 p-2 transition-colors w-full relative z-10 rounded-full"
              style={{
                color: '#fafbfd' ,
                background: colorMode === 'dark' ? '#262626'  :'#262626',
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
            {/* <div className="absolute inset-0 z-0 m-1 flex justify-end">
              <span
                className="h-full w-1/2 rounded-full"
                style={{
                  background: neutralsColorState[colorMode].foreground,
                  transform: 'none',
                }}
              ></span>
            </div> */}
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
              {neutralsColorState[colorMode].copyLighter}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[250px_1fr]">
        <div>
          <div className="mb-4">
            <h2 className="mb-2 text-3xl font-bold">Utility</h2>
            <p className="text-sm text-neutral-600">
              Utility colors denote intention, such as deleting an account.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div
              className="mb-2 w-full rounded-xl shadow-md transition-colors"
              style={{ background: utilityColors.successColor, height: '5rem' }}
            ></div>
            <p className="-mb-1 ml-1 text-lg font-semibold">Success</p>
            <span className="ml-1 text-sm text-neutral-700">
              {utilityColors.successColor}
            </span>
          </div>
          <div>
            <div
              className="mb-2 w-full rounded-xl shadow-md transition-colors"
              style={{ background: utilityColors.warningColor, height: '5rem' }}
            ></div>
            <p className="-mb-1 ml-1 text-lg font-semibold">Warning</p>
            <span className="ml-1 text-sm text-neutral-700">
              {utilityColors.warningColor}
            </span>
          </div>
          <div>
            <div
              className="mb-2 w-full rounded-xl shadow-md transition-colors"
              style={{ background: utilityColors.errorColor, height: '5rem' }}
            ></div>
            <p className="-mb-1 ml-1 text-lg font-semibold">Error</p>
            <span className="ml-1 text-sm text-neutral-700">
              {utilityColors.errorColor}
            </span>
          </div>
          <div>
            <div
              className="mb-2 w-full rounded-xl shadow-md transition-colors"
              style={{
                background: utilityColors.successContentColor,
                height: '5rem',
              }}
            ></div>
            <p className="-mb-1 ml-1 text-lg font-semibold">Success Content</p>
            <span className="ml-1 text-sm text-neutral-700">
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
            <p className="-mb-1 ml-1 text-lg font-semibold">Warning Content</p>
            <span className="ml-1 text-sm text-neutral-700">
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
            <span className="ml-1 text-sm text-neutral-700">
              {utilityColors.errorContentColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Color;
