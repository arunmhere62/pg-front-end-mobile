import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as tenantService from '../../services/tenants/tenantService';
import { Tenant, GetTenantsParams, CreateTenantDto } from '../../services/tenants/tenantService';

interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  tenants: [],
  currentTenant: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchTenants = createAsyncThunk(
  'tenants/fetchAll',
  async (params: GetTenantsParams & { append?: boolean }, { rejectWithValue }) => {
    try {
      const { append, ...apiParams } = params;
      const response = await tenantService.getAllTenants(apiParams);
      return { ...response, append: append || false };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
    }
  }
);

export const fetchTenantById = createAsyncThunk(
  'tenants/fetchById',
  async (
    { id, headers }: { id: number; headers?: { pg_id?: number; organization_id?: number; user_id?: number } },
    { rejectWithValue }
  ) => {
    try {
      const response = await tenantService.getTenantById(id, headers);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant');
    }
  }
);

export const createTenant = createAsyncThunk(
  'tenants/create',
  async (
    { data, headers }: { data: CreateTenantDto; headers?: { pg_id?: number; organization_id?: number; user_id?: number } },
    { rejectWithValue }
  ) => {
    try {
      const response = await tenantService.createTenant(data, headers);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tenant');
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenants/update',
  async (
    { id, data, headers }: { id: number; data: Partial<CreateTenantDto>; headers?: { pg_id?: number; organization_id?: number; user_id?: number } },
    { rejectWithValue }
  ) => {
    try {
      const response = await tenantService.updateTenant(id, data, headers);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant');
    }
  }
);

export const deleteTenant = createAsyncThunk(
  'tenants/delete',
  async (
    { id, headers }: { id: number; headers?: { pg_id?: number; organization_id?: number; user_id?: number } },
    { rejectWithValue }
  ) => {
    try {
      await tenantService.deleteTenant(id, headers);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant');
    }
  }
);

export const checkoutTenant = createAsyncThunk(
  'tenants/checkout',
  async (
    { id, headers }: { id: number; headers?: { pg_id?: number; organization_id?: number; user_id?: number } },
    { rejectWithValue }
  ) => {
    try {
      const response = await tenantService.checkoutTenant(id, headers);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to checkout tenant');
    }
  }
);

const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearCurrentTenant: (state) => {
      state.currentTenant = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tenants
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data;
        // Append data for infinite scroll or replace for new search
        if (action.payload.append && action.payload.pagination?.page > 1) {
          state.tenants = [...state.tenants, ...data];
        } else {
          state.tenants = data;
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch tenant by ID
      .addCase(fetchTenantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTenant = action.payload;
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create tenant
      .addCase(createTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants.push(action.payload);
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update tenant
      .addCase(updateTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tenants.findIndex(t => t.s_no === action.payload.s_no);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
        state.currentTenant = action.payload;
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete tenant
      .addCase(deleteTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = state.tenants.filter(t => t.s_no !== action.payload);
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentTenant, clearError } = tenantSlice.actions;
export default tenantSlice.reducer;
