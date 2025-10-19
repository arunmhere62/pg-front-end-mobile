import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pgLocationService } from '../../services/pgLocationService';
import { PGLocation } from '../../types';

interface PGLocationState {
  locations: PGLocation[];
  currentLocation: PGLocation | null;
  selectedPGLocationId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: PGLocationState = {
  locations: [],
  currentLocation: null,
  selectedPGLocationId: null,
  loading: false,
  error: null,
};

export const fetchPGLocations = createAsyncThunk(
  'pgLocations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await pgLocationService.getPGLocations();
      // Extract data array from response wrapper
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch PG locations');
    }
  }
);

export const createPGLocation = createAsyncThunk(
  'pgLocations/create',
  async (data: Partial<PGLocation>, { rejectWithValue }) => {
    try {
      const response: any = await pgLocationService.createPGLocation(data);
      // Extract data from response wrapper
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create PG location');
    }
  }
);

const pgLocationSlice = createSlice({
  name: 'pgLocations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPGLocation: (state, action) => {
      state.selectedPGLocationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPGLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPGLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload as PGLocation[];
        // Auto-select first PG location if none selected
        const locations = action.payload as PGLocation[];
        if (!state.selectedPGLocationId && locations.length > 0) {
          state.selectedPGLocationId = locations[0].s_no;
        }
      })
      .addCase(fetchPGLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPGLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPGLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.push(action.payload as PGLocation);
      })
      .addCase(createPGLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedPGLocation } = pgLocationSlice.actions;
export default pgLocationSlice.reducer;
