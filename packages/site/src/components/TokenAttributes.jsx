import React, { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Button } from '../ui-components/button';
import { Input } from '../ui-components/input';
import {
  defaultVideoAttributes,
  defaultAudioAttributes,
  defaultImageAttributes,
  defaultOtherAttributes,
} from '../utils/mediaAttributes';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function TokenAttributes({ typeValue, setValueTokenData }) {
  const { register, control, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      attributes: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  const [editableIndex, setEditableIndex] = useState(null);

  useEffect(() => {
    // Define a function to load attributes based on the type
    const loadAttributes = async (defaultAttributes) => {
      // Reset the fields first to ensure a clean state
      reset({ attributes: [] });

      // Then append new attributes
      defaultAttributes.forEach((attribute) => {
        append({
          key: attribute.key,
          value: '',
          ...(attribute.type && { type: attribute.type }),
        });
      });
    };

    switch (typeValue) {
      case 'video':
        loadAttributes(defaultVideoAttributes);
        break;
      case 'audio':
        loadAttributes(defaultAudioAttributes);
        break;
      case 'image':
        loadAttributes(defaultImageAttributes);
        break;
      case 'other':
        loadAttributes(defaultOtherAttributes);
        break;
      default:
        break;
    }
  }, [typeValue, append, reset]);

  const saveAttributes = () => {
    const attributesArray = getValues('attributes');
    let attributes = {};
    for (let attr of attributesArray) {
      attributes[attr.key] = attr.value;
    }

    setValueTokenData('attributes', attributes);
    console.log('Saved attributes:', attributes);
  };

  const edit = (index) => {
    if (editableIndex === index) {
      // If editing the same index, save the changes and reset editableIndex
      saveAttributes();
      setEditableIndex(null);
    } else {
      // If switching to edit a different attribute, save current edits first
      if (editableIndex !== null) {
        saveAttributes();
      }
      setEditableIndex(index);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    append({ key: watchKey, value: watchValue });
    setValue('key', '');
    setValue('value', '');
    saveAttributes(); // Save after appending new attribute
  };

  // The following is useWatch example
  // console.log(useWatch({ name: "attributes", control }));
  const watchKey = watch('key');
  const watchValue = watch('value');

  const isSelectField = (key) => {
    // Determine if the field should be a select based on the default values
    const attribute = [
      ...defaultImageAttributes,
      ...defaultVideoAttributes,
      ...defaultAudioAttributes,
      ...defaultOtherAttributes,
    ].find((attr) => attr.key === key);
    return Array.isArray(attribute?.value);
  };

  const CustomDropdown = ({ options, name, control, defaultValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const dropdownRef = useRef(null);

    const handleSelect = (value) => {
      // Assume selectedValue is now an array of strings
      const selectedValues = selectedValue || [];
      const isSelected = selectedValues.includes(value);

      // Update the selection: add if not selected, remove if already selected
      const updatedValues = isSelected
        ? selectedValues.filter((val) => val !== value)
        : [...selectedValues, value];

      // Only update if there's a change
      if (
        selectedValue.length !== updatedValues.length ||
        !updatedValues.every((val, index) => val === selectedValue[index])
      ) {
        setSelectedValue(updatedValues);
        setValue(name, updatedValues); // Update form state

        // Now save the attributes to persist the changes
        saveAttributes();
      }

      setIsOpen(false);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Update form state when selectedValue changes
    useEffect(() => {
      setValue(name, selectedValue);
    }, [selectedValue, setValue, name]);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div ref={dropdownRef} className="relative inline-block w-full">
        <input
          readOnly
          className="w-full truncate bg-fabstir-light-gray py-2 pl-2 pr-8 text-fabstir-light-gray"
          value={selectedValue || ''}
          title={selectedValue || ''}
          onClick={() => setIsOpen(!isOpen)}
        />
        <ChevronDownIcon
          className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 transform cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        {isOpen && (
          <div className="absolute z-10 w-full border-2 border-fabstir-gray bg-fabstir-gray-700">
            {options.map((option) => {
              return (
                <div
                  key={option}
                  className={`p-2 hover:bg-gray-100 ${
                    selectedValue.includes(option) ? 'bg-fabstir-gray-500' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              );
            })}
          </div>
        )}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="hidden"
              multiple
              value={selectedValue || []}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        />
      </div>
    );
  };

  return (
    <div
      autoComplete="off"
      className="divide-y-2 divide-dotted divide-fabstir-gray bg-fabstir-gray-700"
    >
      {/* <span className="counter">Render Count: {renderCount}</span> */}
      <div>
        <ul>
          <div className="mt-1 rounded-lg bg-fabstir-light-gray text-fabstir-light-gray">
            {/* <input {...register('type')} placeholder="Type" /> */}
            {fields.map((item, index) => {
              return (
                <li key={item.id} className="flex justify-between p-0">
                  <div className="mb-4 mr-4 grid w-full grid-cols-2 divide-x-2 divide-y-0 divide-dotted divide-fabstir-gray rounded-lg border-2 border-fabstir-gray">
                    <Input
                      defaultValue={item.key}
                      {...register(`attributes.${index}.key`)}
                      readOnly
                      className=" w-full bg-fabstir-light-gray py-2 pl-2"
                    />
                    {isSelectField(item.key) ? (
                      <CustomDropdown
                        options={
                          defaultImageAttributes
                            .concat(defaultVideoAttributes)
                            .concat(defaultAudioAttributes)
                            .concat(defaultOtherAttributes)
                            .find((attr) => attr.key === item.key)?.value || []
                        }
                        name={`attributes.${index}.value`}
                        control={control}
                        defaultValue={getValues('attributes')[index]?.value}
                      />
                    ) : (
                      <Controller
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="relative inline-block w-full truncate bg-fabstir-light-gray py-2 pl-2 text-fabstir-light-gray"
                            onBlur={saveAttributes}
                            title={item.key}
                            type={item.type === 'date' ? 'date' : 'text'} // Add this line
                            pattern={
                              item.type === 'date'
                                ? '\\d{4}-\\d{2}-\\d{2}'
                                : undefined
                            } // Add this line
                          />
                        )}
                        name={`attributes.${index}.value`}
                        control={control}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mb-4 bg-fabstir-light-purple px-5"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </div>
        </ul>
      </div>
      {/* <ArrowUpIcon className="h-6 w-6 mt-4 mx-auto" aria-hidden="true" /> */}

      <section className="mt-2 pt-6 text-fabstir-light-gray">
        <div className="flex">
          <div className="[divideStyle: true] mr-6 grid grid-cols-2 divide-x-2 divide-dotted divide-fabstir-gray rounded-lg border-2 border-solid border-fabstir-gray">
            <Input
              type="text"
              placeholder="key"
              register={register('key')}
              className=" bg-fabstir-light-gray py-2 pl-2"
            />
            <div>
              <Input
                placeholder="value"
                register={register('value')}
                className=" bg-fabstir-light-gray py-2 pl-2"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            color="fabstir-purple"
            className="px-4 py-1 text-fabstir-light-gray-600"
          >
            Append
          </Button>
        </div>
      </section>

      {/* <Input type="submit" /> */}
    </div>
  );
}
