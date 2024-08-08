import React, { use, useEffect, useRef, useState } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { Button } from '../ui-components/button';
import { Input } from '../ui-components/input';
import {
  defaultVideoAttributes,
  defaultAudioAttributes,
  defaultImageAttributes,
  defaultOtherAttributes,
} from '../utils/mediaAttributes';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Select } from '../ui-components/select';
import { Text } from '../ui-components/text';

export default function TokenAttributes({ typeValue, setValueTokenData }) {
  // const { register, control, watch, setValue, getValues, reset } = useForm({
  //   defaultValues: {
  //     attributes: [],
  //     key: '',
  //     value: '',
  //   },
  // });

  const { register, control, watch, setValue, getValues } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  const [editableIndex, setEditableIndex] = useState(null);

  useEffect(() => {
    // Define a function to load attributes based on the type
    const loadAttributes = async (defaultAttributes) => {
      // Reset the fields first to ensure a clean state
      setValue('attributes', []);

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
  }, [typeValue, append]);

  const edit = (index) => {
    if (editableIndex === index) {
      // If editing the same index, save the changes and reset editableIndex
      setEditableIndex(null);
    } else {
      // If switching to edit a different attribute, save current edits first
      setEditableIndex(index);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    append({ key: watchKey, value: watchValue });
    setValue('key', '');
    setValue('value', '');
  };

  // The following is useWatch example
  // console.log(useWatch({ name: "attributes", control }));
  const watchKey = watch('key');
  const watchValue = watch('value');

  useEffect(() => {
    console.log('watchKey:', watchKey);
    console.log('watchValue:', watchValue);
  }, [watch('key'), watch('value')]);

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
    return (
      <div className="relative inline-block w-full">
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => (
            <Select
              {...field}
              options={options.map((option) => ({
                value: option,
                label: option,
              }))}
              multiple={true}
              value={field.value || []}
              onChange={(value) => {
                field.onChange(value);
              }}
              className="block w-full bg-fabstir-white py-2 pl-2 pr-8 text-fabstir-dark-gray"
            />
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
          <div className="mt-1 rounded-lg">
            {/* <input {...register('type')} placeholder="Type" /> */}
            {fields.map((item, index) => {
              return (
                <li key={item.id} className="flex justify-between p-0">
                  <div className="mb-4 mr-4 grid w-full grid-cols-2 divide-x-2 divide-y-0 divide-dotted divide-fabstir-gray rounded-lg">
                    <Text
                      defaultValue={item.key}
                      {...register(`attributes.${index}.key`)}
                      readOnly
                      className="w-full py-2 pl-2"
                      as="input"
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
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => remove(index)}
                    className="mb-4 px-5 border-fabstir-gray border-2 rounded-md"
                  >
                    Delete
                  </Button>
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
            variant="primary"
            size="medium"
            onClick={handleSubmit}
            color="fabstir-gray"
            className="px-4 py-1 rounded-md"
          >
            Append
          </Button>
        </div>
      </section>

      {/* <Input type="submit" /> */}
    </div>
  );
}
