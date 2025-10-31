import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ticketService, { CreateTicketData, UpdateTicketData, AddCommentData, TicketFilters } from '../../services/ticketService';

interface Ticket {
  s_no: number;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reported_by: number;
  assigned_to?: number;
  organization_id?: number;
  pg_id?: number;
  attachments?: string[];
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  users_issue_tickets_reported_byTousers?: any;
  users_issue_tickets_assigned_toTousers?: any;
  issue_ticket_comments?: any[];
}

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  stats: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  pagination: null,
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async ({ filters, append = false }: { filters?: TicketFilters; append?: boolean }) => {
    const response = await ticketService.getTickets(filters);
    return { ...response, append };
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (id: number) => {
    const response = await ticketService.getTicketById(id);
    return response;
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (data: CreateTicketData) => {
    const response = await ticketService.createTicket(data);
    return response;
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, data }: { id: number; data: UpdateTicketData }) => {
    const response = await ticketService.updateTicket(id, data);
    return response;
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/deleteTicket',
  async (id: number) => {
    await ticketService.deleteTicket(id);
    return id;
  }
);

export const addComment = createAsyncThunk(
  'tickets/addComment',
  async ({ ticketId, data }: { ticketId: number; data: AddCommentData }) => {
    const response = await ticketService.addComment(ticketId, data);
    return response;
  }
);

export const fetchStats = createAsyncThunk(
  'tickets/fetchStats',
  async () => {
    const response = await ticketService.getStats();
    return response;
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.append) {
          state.tickets = [...state.tickets, ...action.payload.data];
        } else {
          state.tickets = action.payload.data;
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tickets';
      })
      
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload.data;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ticket';
      })
      
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = [action.payload.data, ...state.tickets];
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create ticket';
      })
      
      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(t => t.s_no === action.payload.data.s_no);
        if (index !== -1) {
          state.tickets[index] = action.payload.data;
        }
        if (state.currentTicket?.s_no === action.payload.data.s_no) {
          state.currentTicket = action.payload.data;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update ticket';
      })
      
      // Delete ticket
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(t => t.s_no !== action.payload);
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete ticket';
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentTicket) {
          state.currentTicket.issue_ticket_comments = [
            ...(state.currentTicket.issue_ticket_comments || []),
            action.payload.data,
          ];
        }
      })
      
      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearCurrentTicket, clearError } = ticketSlice.actions;
export default ticketSlice.reducer;
