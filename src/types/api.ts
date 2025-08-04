export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  timestamp: string;
}

export interface Instance {
  id: string;
  name: string;
  status: string | null;
  flavor: string | null;
  image: string | null;
  networkId: string | null;
  privateIp: string | null;
  publicIp: string | null;
  availabilityZone: string | null;
  keyName: string | null;
  metadata: Record<string, string> | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Network {
  id: string;
  name: string;
  status: string;
  adminStateUp: boolean;
  shared: boolean;
  tenantId: string;
  subnets: Subnet[];
  createdAt: string;
  updatedAt: string;
}

export interface Subnet {
  id: string;
  name: string;
  networkId: string;
  cidr: string;
  gatewayIp: string;
  dnsNameservers: string[];
  allocationPools: AllocationPool[];
}

export interface AllocationPool {
  start: string;
  end: string;
}

export interface Volume {
  id: string;
  name: string;
  status: string;
  size: number;
  volumeType: string;
  availabilityZone: string;
  attachments: VolumeAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface VolumeAttachment {
  id: string;
  serverId: string;
  device: string;
  attachmentId: string;
}

export interface Image {
  id: string;
  name: string;
  status: string;
  visibility: string;
  diskFormat: string;
  containerFormat: string;
  size: number;
  minDisk: number;
  minRam: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  domainId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  domainId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstanceRequest {
  name: string;
  flavor?: string;
  image?: string;
  networkId?: string;
  metadata?: Record<string, string>;
}

export interface CreateNetworkRequest {
  name: string;
  adminStateUp?: boolean;
  shared?: boolean;
  tenantId?: string;
}

export interface CreateVolumeRequest {
  name: string;
  size: number;
  volumeType?: string;
  availabilityZone?: string;
}

export interface CreateImageRequest {
  name: string;
  diskFormat: string;
  containerFormat?: string;
  visibility?: string;
  minDisk?: number;
  minRam?: number;
  metadata?: Record<string, string>;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  domainId?: string;
  enabled?: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  domainId?: string;
  enabled?: boolean;
}

export interface CreateDomainRequest {
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
} 