
export type ApiResponse<T> = {
  data: T;
  error?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
};

export type Assessment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
};
