// VM API Types based on swagger documentation

export interface VmResponse {
  name: string;
  namespace: string;
  status: 'Running' | 'Stopped' | 'Pending' | 'Error' | 'Terminated';
  phase: 'Running' | 'Scheduling' | 'Scheduled' | 'Failed' | 'Unknown';
  cpuCores: number;
  memory: string;
  image: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  ipAddress?: string;
  publicIpAddress?: string;
  nodeName?: string;
  cpuUsage?: string;
  memoryUsage?: string;
}

export interface VmListResponse {
  vms: VmResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  runningCount: number;
  stoppedCount: number;
  errorCount: number;
  pendingCount: number;
}

export interface VmCreateRequest {
  name: string;
  namespace: string;
  cpuCores: number;
  memoryGb: number;
  image: string;
  description?: string;
  labels?: string;
  password?: string;
  enablePublicIp?: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: Record<string, string>;
}
