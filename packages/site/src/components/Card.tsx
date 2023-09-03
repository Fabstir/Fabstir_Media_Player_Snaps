import { ReactNode } from 'react';

type CardProps = {
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};

export const Card = ({ content, disabled = false, fullWidth }: CardProps) => {
  const { title, description, button } = content;
  return (
    <div
      className={`flex flex-col 
                  ${fullWidth ? 'w-full' : 'w-64'} 
                  bg-gray-100 
                  mt-6 mb-6 p-6 
                  border border-gray-300 
                  rounded-md 
                  shadow-md 
                  ${disabled ? 'opacity-40' : 'opacity-100'} 
                  self-stretch 
                  sm:w-full sm:mt-3 sm:mb-3 sm:p-4`}
    >
      {title && <h2 className="text-xl mb-0 sm:text-base">{title}</h2>}
      <div className="mt-6 mb-6">{description}</div>
      {button}
    </div>
  );
};
