// components/ColorSelect.tsx
import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';

const ColorSelect = ({ label, value, onChange, colors }) => {
  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      classNames={{
        label: 'group-data-[filled=true]:-translate-y-5',
        trigger: 'min-h-16',
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
          content: 'p-0 border-small border-divider bg-background',
        },
      }}
    >
      {colors.map((item, index) => (
        <SelectItem key={index} value={item.value}>
          <div className="flex gap-2 items-center">
            <div
              className="h-10 w-10"
              style={{ backgroundColor: item.value }}
            ></div>
            <div className="flex flex-col">{item.label}</div>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
};

export default ColorSelect;
