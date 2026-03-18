export interface Label {
  id: string;
  color: string;
  name: string;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  label: Label;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  order: number;
  labels: TaskLabel[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  date: string;
  labelIds?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  date?: string;
  order?: number;
  labelIds?: string[];
}

export interface ReorderPayload {
  taskIds: string[];
  date: string;
}
