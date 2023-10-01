import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

/**
 * TokenAttributes Component
 * @param {Object} props - Properties passed to the component
 * @param {function} props.setValueTokenData - Function to set value token data
 * @returns {JSX.Element} - Rendered TokenAttributes component
 */
export default function TokenAttributes({ setValueTokenData }) {
  const { register, control, watch, setValue, getValues } = useForm({
    defaultValues: {
      attributes: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  /**
   * Handles form submission.
   * @param {Event} e - The event object
   */
  const onSubmit = (e) => {
    e.preventDefault();
    append({ key: watchKey, value: watchValue });
    setValue('key', '');
    setValue('value', '');

    const attributesArray = getValues().attributes;
    let attributes = {};
    for (let idx in attributesArray)
      attributes[attributesArray[idx].key] = attributesArray[idx].value;

    //      setValueTokenData('attributes', JSON.stringify(attributes))
    setValueTokenData('attributes', attributes);
    console.log('TokenAttributes: getValues() = ', getValues());
    console.log('TokenAttributes: attributes = ', attributes);
    //              handleSubmit(onSubmit)
  };

  /** Watch the 'key' field value */
  const watchKey = watch('key');
  /** Watch the 'value' field value */
  const watchValue = watch('value');

  return (
    <form
      autoComplete="off"
      className="divide-y-2 divide-dotted divide-fabstir-gray bg-fabstir-white"
      //   onSubmit={(e) => {
      //     e.preventDefault()
      //     handleSubmit(onSubmit)
      //   }}
      //   method="POST"
    >
      {/* <span className="counter">Render Count: {renderCount}</span> */}
      <div>
        <ul>
          <div className="mt-1 rounded-lg bg-fabstir-dark-gray text-fabstir-light-gray">
            {fields.map((item, index) => {
              return (
                <div>
                  <li key={item.id} className="flex justify-between p-0">
                    <div className="mr-6 mb-4 grid grid-cols-2 divide-x-2 divide-y-0 divide-dotted divide-fabstir-gray rounded-lg border-2 border-fabstir-gray">
                      <input
                        {...register(`attributes.${index}.key`)}
                        readOnly
                        className=" bg-fabstir-dark-gray py-2 pl-2"
                      />
                      <Controller
                        render={({ field }) => (
                          <input
                            {...field}
                            readOnly
                            className="bg-fabstir-dark-gray py-2 pl-2"
                          />
                        )}
                        name={`attributes.${index}.value`}
                        control={control}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mb-4 bg-fabstir-light-purple px-5"
                    >
                      Delete
                    </button>
                  </li>
                </div>
              );
            })}
          </div>
        </ul>
      </div>
      {/* <ArrowUpIcon className="h-6 w-6 mt-4 mx-auto" aria-hidden="true" /> */}

      <section className="mt-2 pt-6 text-fabstir-light-gray">
        <div className="flex">
          <div className="[divideStyle: true] mr-6 grid grid-cols-2 divide-x-2 divide-dotted divide-fabstir-gray rounded-lg border-2 border-solid border-fabstir-gray">
            <input
              name="key"
              placeholder="key"
              {...register('key')}
              className=" bg-fabstir-dark-gray py-2 pl-2"
            />
            <div>
              <input
                name="value"
                placeholder="value"
                {...register('value')}
                className=" bg-fabstir-dark-gray py-2 pl-2"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            className="bg-fabstir-light-purple px-4 py-1"
          >
            Append
          </button>
        </div>
      </section>

      {/* <input type="submit" /> */}
    </form>
  );
}
