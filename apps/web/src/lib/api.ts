import {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  FollowUp,
  Event,
  Notification,
  ErrorResponse,
} from '@ghost-hunter/shared';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ErrorResponse | null;
    throw new ApiError(
      errorData?.error?.code || 'UNKNOWN_ERROR',
      errorData?.error?.message || `HTTP ${response.status}`,
      errorData?.error?.fields
    );
  }

  return data as T;
}

export const api = {
  // Applications CRUD
  async listApplications(status?: string): Promise<Application[]> {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return request<Application[]>(`/applications${query}`);
  },

  async getApplication(id: string): Promise<Application> {
    return request<Application>(`/applications/${id}`);
  },

  async createApplication(input: CreateApplicationInput): Promise<Application> {
    return request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateApplication(id: string, input: UpdateApplicationInput): Promise<Application> {
    return request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteApplication(id: string): Promise<{ success: boolean; id: string }> {
    return request<{ success: boolean; id: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Events & FollowUps
  async getApplicationEvents(id: string): Promise<Event[]> {
    return request<Event[]>(`/applications/${id}/events`);
  },

  async getApplicationFollowUps(id: string): Promise<FollowUp[]> {
    return request<FollowUp[]>(`/applications/${id}/followups`);
  },

  // Workflow & Decision Actions
  async startHunt(
    id: string,
    options?: { cadenceSchedule?: number[]; maxFollowUps?: number; isDemoMode?: boolean }
  ): Promise<{ success: boolean; workflowId: string; status: string }> {
    return request<{ success: boolean; workflowId: string; status: string }>(
      `/applications/${id}/start`,
      {
        method: 'POST',
        body: JSON.stringify(options || {}),
      }
    );
  },

  async replyHunt(
    id: string,
    payload?: { repliedAt?: string; note?: string }
  ): Promise<{ success: boolean; status: string }> {
    return request<{ success: boolean; status: string }>(`/applications/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  async cancelHunt(
    id: string,
    payload?: { reason?: string }
  ): Promise<{ success: boolean; status: string }> {
    return request<{ success: boolean; status: string }>(`/applications/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  async submitDecision(
    id: string,
    payload: {
      action: 'approve' | 'skip' | 'snooze';
      editedBody?: string;
      snoozeDurationMs?: number;
    }
  ): Promise<{ success: boolean; action: string }> {
    return request<{ success: boolean; action: string }>(
      `/applications/${id}/decision`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async getWorkflowState(id: string): Promise<any> {
    return request<any>(`/applications/${id}/state`);
  },

  async getNotifications(unreadOnly?: boolean): Promise<Notification[]> {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return request<Notification[]>(`/notifications${query}`);
  },

  async markNotificationsRead(payload: {
    notificationIds?: string[];
    all?: boolean;
  }): Promise<{ success: boolean; count: number }> {
    return request<{ success: boolean; count: number }>(
      '/notifications/read',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  // System & Telemetry Diagnostics
  async getHealth(): Promise<{ status: string; taskQueue: string; timestamp: string }> {
    return request<{ status: string; taskQueue: string; timestamp: string }>('/health');
  },

  async getModelStatus(): Promise<{
    status: 'ok' | 'degraded' | 'offline';
    model: string;
    baseUrl: string;
    latencyMs: number | null;
    installedModels?: string[];
    error?: string;
  }> {
    return request('/system/model-status');
  },

  async testGenerate(): Promise<{
    success: boolean;
    source: string;
    latencyMs: number;
    response?: string;
    message?: string;
  }> {
    return request('/system/test-generate', { method: 'POST' });
  },
};
