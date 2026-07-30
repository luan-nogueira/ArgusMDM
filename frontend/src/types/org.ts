export interface DepartmentResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface DepartmentRequest {
  name: string;
  description?: string;
}

export interface TagResponse {
  id: string;
  name: string;
  color: string | null;
}

export interface TagRequest {
  name: string;
  color?: string;
}
