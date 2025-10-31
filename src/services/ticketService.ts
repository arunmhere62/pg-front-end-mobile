import axiosInstance from './axiosInstance';

export interface CreateTicketData {
  title: string;
  description: string;
  category: 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attachments?: string[];
  pg_id?: number;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  category?: 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT' | 'OTHER';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  assigned_to?: number;
  attachments?: string[];
}

export interface AddCommentData {
  comment: string;
  attachments?: string[];
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  my_tickets?: boolean;
  search?: string;
}

const ticketService = {
  // Create a new ticket
  createTicket: async (data: CreateTicketData) => {
    const response = await axiosInstance.post('/tickets', data);
    return response.data;
  },

  // Get all tickets with filters
  getTickets: async (filters: TicketFilters = {}) => {
    const response = await axiosInstance.get('/tickets', { params: filters });
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id: number) => {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id: number, data: UpdateTicketData) => {
    const response = await axiosInstance.patch(`/tickets/${id}`, data);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id: number) => {
    const response = await axiosInstance.delete(`/tickets/${id}`);
    return response.data;
  },

  // Add comment to ticket
  addComment: async (ticketId: number, data: AddCommentData) => {
    const response = await axiosInstance.post(`/tickets/${ticketId}/comments`, data);
    return response.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await axiosInstance.get('/tickets/stats');
    return response.data;
  },
};

export default ticketService;
