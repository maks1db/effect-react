import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSubscription } from '../../../../../src';
import { WarningMessageStore } from './model';

export const WarningMessage: FC<WarningMessageProps> = ({ className }) => {
  const timer = useSubscription(WarningMessageStore, x => x.timer);

  if (timer === 0) {
    return null;
  }

  return <div className={twMerge(className)}>
    {`Do not press the buttons for ${timer} seconds. An error will occur`}
  </div>;
};

interface WarningMessageProps {
    className?: string
}