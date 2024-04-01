/* eslint-disable react/button-has-type */
import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';

export const Button: FC<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = props => {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      {...props}
    />
  );
};
