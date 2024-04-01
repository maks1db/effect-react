import { useProgram } from '../../../../../src';
import { CounterView } from '../../features/counter';
import { WarningMessage } from '../../features/warning-message';
import { downButtonClicked, program, upButtonClicked } from './model';

export function Main() {
  useProgram(program);
  return (
    <div className="p-8">
      <CounterView
        onDownClick={downButtonClicked}
        onUpClick={upButtonClicked}
      />
      <WarningMessage className="mt-8 text-center" />
    </div>
  );
}
