import { FC } from 'react';

import { useSubscription } from '../../../../../src';
import { Counter } from './model';
import { Button } from './ui/Button';

export const CounterView: FC<CounterViewProps> = ({
  onDownClick,
  onUpClick,
}) => {
  const value = useSubscription(Counter);

  return (
    <div className="flex gap-8 justify-center items-center">
      <Button onClick={onDownClick}>Down</Button>
      <div>{value}</div>
      <Button onClick={onUpClick}>Up</Button>
    </div>
  );
};

interface CounterViewProps {
  onDownClick: () => void;
  onUpClick: () => void;
}
