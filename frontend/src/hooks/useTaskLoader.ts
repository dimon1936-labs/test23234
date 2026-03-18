import { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useNavigation } from '../context/NavigationContext';

export function useTaskLoader() {
  const { actions: { loadTasks } } = useTaskContext();
  const { state: { currentMonth, currentYear } } = useNavigation();

  useEffect(() => {
    const controller = new AbortController();
    loadTasks(currentMonth + 1, currentYear, controller.signal);
    return () => controller.abort();
  }, [loadTasks, currentMonth, currentYear]);
}
