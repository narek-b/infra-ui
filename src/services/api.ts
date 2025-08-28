import { VmListResponse, VmResponse, VmCreateRequest, ErrorResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // List VMs with pagination
  async listVms(namespace: string, page: number = 1, pageSize: number = 20): Promise<VmListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    return this.request<VmListResponse>(`/api/v1/vms/${namespace}?${params}`);
  }

  // Get specific VM
  async getVm(namespace: string, name: string): Promise<VmResponse> {
    return this.request<VmResponse>(`/api/v1/vms/${namespace}/${name}`);
  }

  // Create VM
  async createVm(vmData: VmCreateRequest): Promise<string> {
    return this.request<string>('/api/v1/vms', {
      method: 'POST',
      body: JSON.stringify(vmData),
    });
  }

  // Delete VM
  async deleteVm(namespace: string, name: string): Promise<string> {
    return this.request<string>(`/api/v1/vms/${namespace}/${name}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async getHealth(): Promise<any> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
