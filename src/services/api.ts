import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  Instance,
  Network,
  Volume,
  Image,
  User,
  Project,
  Domain,
  Role,
  CreateInstanceRequest,
  CreateNetworkRequest,
  CreateVolumeRequest,
  CreateImageRequest,
  CreateUserRequest,
  CreateProjectRequest,
  CreateDomainRequest,
  CreateRoleRequest,
} from '../types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.data);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Instance Management
  async getInstances(): Promise<ApiResponse<Instance[]>> {
    const response = await this.api.get('/instances');
    return response.data;
  }

  async getInstance(id: string): Promise<ApiResponse<Instance>> {
    const response = await this.api.get(`/instances/${id}`);
    return response.data;
  }

  async createInstance(request: CreateInstanceRequest): Promise<ApiResponse<Instance>> {
    const response = await this.api.post('/instances', request);
    return response.data;
  }

  async deleteInstance(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/instances/${id}`);
    return response.data;
  }

  async startInstance(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/instances/${id}/start`);
    return response.data;
  }

  async stopInstance(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/instances/${id}/stop`);
    return response.data;
  }

  async rebootInstance(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/instances/${id}/reboot`);
    return response.data;
  }

  // Network Management
  async getNetworks(): Promise<ApiResponse<Network[]>> {
    const response = await this.api.get('/networks');
    return response.data;
  }

  async getNetwork(id: string): Promise<ApiResponse<Network>> {
    const response = await this.api.get(`/networks/${id}`);
    return response.data;
  }

  async createNetwork(request: CreateNetworkRequest): Promise<ApiResponse<Network>> {
    const response = await this.api.post('/networks', request);
    return response.data;
  }

  async deleteNetwork(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/networks/${id}`);
    return response.data;
  }

  // Volume Management
  async getVolumes(): Promise<ApiResponse<Volume[]>> {
    const response = await this.api.get('/volumes');
    return response.data;
  }

  async getVolume(id: string): Promise<ApiResponse<Volume>> {
    const response = await this.api.get(`/volumes/${id}`);
    return response.data;
  }

  async createVolume(request: CreateVolumeRequest): Promise<ApiResponse<Volume>> {
    const response = await this.api.post('/volumes', request);
    return response.data;
  }

  async deleteVolume(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/volumes/${id}`);
    return response.data;
  }

  async attachVolume(volumeId: string, instanceId: string, device: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/volumes/${volumeId}/attach`, {
      instanceId,
      device,
    });
    return response.data;
  }

  async detachVolume(volumeId: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/volumes/${volumeId}/detach`);
    return response.data;
  }

  // Image Management
  async getImages(): Promise<ApiResponse<Image[]>> {
    const response = await this.api.get('/images');
    return response.data;
  }

  async getImage(id: string): Promise<ApiResponse<Image>> {
    const response = await this.api.get(`/images/${id}`);
    return response.data;
  }

  async createImage(request: CreateImageRequest): Promise<ApiResponse<Image>> {
    const response = await this.api.post('/images', request);
    return response.data;
  }

  async deleteImage(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/images/${id}`);
    return response.data;
  }

  // Identity Management
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await this.api.get('/identity/users');
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.api.get(`/identity/users/${id}`);
    return response.data;
  }

  async createUser(request: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.api.post('/identity/users', request);
    return response.data;
  }

  async updateUser(id: string, request: Partial<CreateUserRequest>): Promise<ApiResponse<User>> {
    const response = await this.api.put(`/identity/users/${id}`, request);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/identity/users/${id}`);
    return response.data;
  }

  async enableUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/identity/users/${id}/enable`);
    return response.data;
  }

  async disableUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/identity/users/${id}/disable`);
    return response.data;
  }

  async getDomains(): Promise<ApiResponse<Domain[]>> {
    const response = await this.api.get('/identity/domains');
    return response.data;
  }

  async getDomain(id: string): Promise<ApiResponse<Domain>> {
    const response = await this.api.get(`/identity/domains/${id}`);
    return response.data;
  }

  async createDomain(request: CreateDomainRequest): Promise<ApiResponse<Domain>> {
    const response = await this.api.post('/identity/domains', request);
    return response.data;
  }

  async updateDomain(id: string, request: Partial<CreateDomainRequest>): Promise<ApiResponse<Domain>> {
    const response = await this.api.put(`/identity/domains/${id}`, request);
    return response.data;
  }

  async deleteDomain(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/identity/domains/${id}`);
    return response.data;
  }

  // Tenant Management
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.api.get('/tenants/projects');
    return response.data;
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.api.get(`/tenants/projects/${id}`);
    return response.data;
  }

  async createProject(request: CreateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await this.api.post('/tenants/projects', request);
    return response.data;
  }

  async updateProject(id: string, request: Partial<CreateProjectRequest>): Promise<ApiResponse<Project>> {
    const response = await this.api.put(`/tenants/projects/${id}`, request);
    return response.data;
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/tenants/projects/${id}`);
    return response.data;
  }

  async enableProject(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/tenants/projects/${id}/enable`);
    return response.data;
  }

  async disableProject(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/tenants/projects/${id}/disable`);
    return response.data;
  }

  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await this.api.get('/tenants/roles');
    return response.data;
  }

  async getRole(id: string): Promise<ApiResponse<Role>> {
    const response = await this.api.get(`/tenants/roles/${id}`);
    return response.data;
  }

  async createRole(request: CreateRoleRequest): Promise<ApiResponse<Role>> {
    const response = await this.api.post('/tenants/roles', request);
    return response.data;
  }

  async updateRole(id: string, request: Partial<CreateRoleRequest>): Promise<ApiResponse<Role>> {
    const response = await this.api.put(`/tenants/roles/${id}`, request);
    return response.data;
  }

  async deleteRole(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/tenants/roles/${id}`);
    return response.data;
  }

  // Health Checks
  async getHealth(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  async getIdentityHealth(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/identity/health');
    return response.data;
  }

  async getTenantHealth(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/tenants/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 