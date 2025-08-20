import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://profilexbackend.onrender.com/api';

// Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  messageType: 'general' | 'project' | 'collaboration' | 'job' | 'other';
  portfolioSlug: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  messageType: 'general' | 'project' | 'collaboration' | 'job' | 'other';
  portfolioSlug: string;
}

export interface MessageFilters {
  status?: string;
  messageType?: string;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'subject';
  sortOrder?: 'asc' | 'desc';
}

// API Functions
export const submitContactForm = async (data: ContactFormData): Promise<ContactMessage> => {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to send message' }));
    throw new Error(errorData.message || 'Failed to send message');
  }

  const result = await response.json();
  return result.data || result;
};

export const getMessages = async (
  portfolioSlug: string,
  filters?: MessageFilters,
  token?: string
): Promise<{ messages: ContactMessage[]; total: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.messageType) params.append('messageType', filters.messageType);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const url = `${API_BASE_URL}/contact/${portfolioSlug}${params.toString() ? `?${params.toString()}` : ''}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch messages' }));
    throw new Error(errorData.message || 'Failed to fetch messages');
  }

  const result = await response.json();
  return result.data || result;
};

export const updateMessageStatus = async (
  messageId: string,
  status: ContactMessage['status'],
  token: string
): Promise<ContactMessage> => {
  const response = await fetch(`${API_BASE_URL}/contact/${messageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update message status' }));
    throw new Error(errorData.message || 'Failed to update message status');
  }

  const result = await response.json();
  return result.data || result;
};

export const deleteMessage = async (messageId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete message' }));
    throw new Error(errorData.message || 'Failed to delete message');
  }
};

export const getMessageStats = async (
  portfolioSlug: string,
  token: string
): Promise<{
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
  byType: Record<string, number>;
}> => {
  const response = await fetch(`${API_BASE_URL}/contact/${portfolioSlug}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch message stats' }));
    throw new Error(errorData.message || 'Failed to fetch message stats');
  }

  const result = await response.json();
  return result.data || result;
};

// React Query Hooks
export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      // Optionally invalidate queries here
    },
    onError: (error) => {
      console.error('Failed to submit contact form:', error);
    },
  });
};

export const useMessages = (
  portfolioSlug: string,
  filters?: MessageFilters,
  token?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['messages', portfolioSlug, filters],
    queryFn: () => getMessages(portfolioSlug, filters, token),
    enabled: enabled && !!portfolioSlug,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, status, token }: { messageId: string; status: ContactMessage['status']; token: string }) =>
      updateMessageStatus(messageId, status, token),
    onSuccess: (_, variables) => {
      // Invalidate messages queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messageStats'] });
    },
    onError: (error) => {
      console.error('Failed to update message status:', error);
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, token }: { messageId: string; token: string }) =>
      deleteMessage(messageId, token),
    onSuccess: () => {
      // Invalidate messages queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messageStats'] });
    },
    onError: (error) => {
      console.error('Failed to delete message:', error);
    },
  });
};

export const useMessageStats = (portfolioSlug: string, token: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['messageStats', portfolioSlug],
    queryFn: () => getMessageStats(portfolioSlug, token),
    enabled: enabled && !!portfolioSlug && !!token,
    staleTime: 60 * 1000, // 1 minute
  });
};
