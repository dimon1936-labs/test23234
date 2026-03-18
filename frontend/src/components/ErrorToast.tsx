import { useTaskContext } from '../context/TaskContext';
import { Toast } from './Toast';

export function ErrorToast() {
  const { state, actions } = useTaskContext();
  return (
    <Toast
      message={state.error}
      variant="error"
      onClose={actions.clearError}
    />
  );
}
