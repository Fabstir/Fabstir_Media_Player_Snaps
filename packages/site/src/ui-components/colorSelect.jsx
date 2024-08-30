import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';

const ColorSelect = ({
  label,
  value,
  onChange,
  colors,
  register,
  name,
  errors,
}) => {
  console.log('Current value:', value);
  console.log('Available colors:', colors);

  return (
    <React.Fragment>
      <label htmlFor={name} className="mb-2 font-medium">
        {label}
      </label>
      <Select
        id={name}
        aria-label={label}
        value={value}
        onChange={(val) => onChange(val)}
        {...register(name, { required: true })}
        items={colors}
        classNames={{
          label: 'group-data-[filled=true]:-translate-y-5',
          trigger: 'min-h-14 bg-neutral-300 rounded-md',
          listboxWrapper: 'max-h-[400px]',
        }}
        listboxProps={{
          itemClasses: {
            base: [
              'rounded-md',
              'text-default-500',
              'transition-opacity',
              'data-[hover=true]:text-foreground',
              'data-[hover=true]:bg-default-100',
              'dark:data-[hover=true]:bg-default-50',
              'data-[selectable=true]:focus:bg-default-50',
              'data-[pressed=true]:opacity-70',
              'data-[focus-visible=true]:ring-default-500',
            ],
          },
        }}
        popoverProps={{
          classNames: {
            base: 'before:bg-default-200',
            content: 'p-0 border-small border-divider bg-light-gray',
          },
        }}
        renderValue={(items) => {
          return items.map((color) => (
            <div key={color.key} className="flex gap-2 items-center">
              <div
                className="h-8 w-8  rounded-full"
                style={{ backgroundColor: color.props.value }}
              ></div>
              <div className="flex flex-col">{color.props.textValue}</div>
            </div>
          ));
        }}
      >
        {colors.map((color) => (
          <SelectItem
            key={color.value}
            value={color.value}
            textValue={color.label}
          >
            <div className="flex gap-2 items-center">
              <div
                className="h-8 w-8  rounded-full"
                style={{ backgroundColor: color.value }}
              ></div>
              <div className="flex flex-col">{color.label}</div>
            </div>
          </SelectItem>
        ))}
      </Select>
      {/* {errors[name] && (
        <p className="text-red-500 text-xs mt-1 absolute left-3 -bottom-1.5">
          This field is required
        </p>
      )} */}
    </React.Fragment>
  );
};

export default ColorSelect;
