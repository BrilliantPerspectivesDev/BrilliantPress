import { TeamMember } from '@/types';
import { auth } from './firebase';

const API_BASE = '/api';

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const idToken = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
  };
}

// Helper function to parse dates from API responses
function parseApiResponse(data: Record<string, unknown>): TeamMember {
  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt as string) : new Date(),
  } as TeamMember;
}

// Team Members API
export const teamMembersApi = {
  // Get all team members
  getAll: async (): Promise<TeamMember[]> => {
    const response = await fetch(`${API_BASE}/team-members`);
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    const data = await response.json();
    return data.map(parseApiResponse);
  },

  // Get single team member
  getById: async (id: string): Promise<TeamMember> => {
    const response = await fetch(`${API_BASE}/team-members/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch team member');
    }
    const data = await response.json();
    return parseApiResponse(data);
  },

  // Create new team member
  create: async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/team-members`, {
      method: 'POST',
      headers,
      body: JSON.stringify(memberData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create team member');
    }
    return response.json();
  },

  // Update team member
  update: async (id: string, memberData: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/team-members/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(memberData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update team member');
    }
  },

  // Delete team member
  delete: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/team-members/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete team member');
    }
  },
};

// Upload API
export const uploadApi = {
  // Upload image
  uploadImage: async (file: File, path?: string): Promise<{ url: string }> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const idToken = await user.getIdToken();
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    return response.json();
  },
}; 