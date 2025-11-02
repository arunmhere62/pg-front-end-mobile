import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllOrganizations,
  getOrganizationStats,
  Organization,
  OrganizationStats,
  GetOrganizationsParams,
} from '../../services/organization/organizationService';

interface OrganizationState {
  organizations: Organization[];
  stats: OrganizationStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
}

const initialState: OrganizationState = {
  organizations: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null,
};

/**
 * Fetch all organizations
 */
export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (params: GetOrganizationsParams = {}, { rejectWithValue }) => {
    try {
      const response = await getAllOrganizations(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizations');
    }
  }
);

/**
 * Fetch organization statistics
 */
export const fetchOrganizationStats = createAsyncThunk(
  'organizations/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrganizationStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearOrganizations: (state) => {
      state.organizations = [];
      state.pagination = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch organizations
    builder.addCase(fetchOrganizations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.loading = false;
      // Replace data instead of appending (for page navigation)
      state.organizations = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch stats
    builder.addCase(fetchOrganizationStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizationStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchOrganizationStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearOrganizations, clearError } = organizationSlice.actions;
export default organizationSlice.reducer;
