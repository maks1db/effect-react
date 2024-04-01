/* eslint-disable @typescript-eslint/no-use-before-define */
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { useProgram, useSubscription } from '../../../../../src';
import { WarningMessageStore, program } from './model';

export const WarningMessage: FC<BaseProps> = ({ className }) => {
  const timer = useSubscription(WarningMessageStore, x => x.timer);
  useProgram(program);

  if (timer === 0) {
    return null;
  }

  return (
    <>
      <div className={twMerge(className)}>
        {`Do not press the buttons for ${timer} seconds. An error will occur`}
      </div>
      <ErrorClicks className="text-center mt-8" />
    </>
  );
};

export const ErrorClicks: FC<BaseProps> = ({ className }) => {
  const value = useSubscription(WarningMessageStore, x => x.clickErrorCounter);
  if (value === 0) {
    return null;
  }
  return (
    <div
      className={twMerge(className, 'text-red-700')}
    >{`You clicked: ${value}. Stop...`}</div>
  );
};

interface BaseProps {
  className?: string;
}
