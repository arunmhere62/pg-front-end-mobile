import axiosInstance from '../core/axiosInstance';

export interface Visitor {
  s_no: number;
  pg_id?: number;
  visitor_name?: string;
  phone_no?: string;
  purpose?: string;
  visited_date?: string;
  visited_room_id?: number;
  visited_bed_id?: number;
  city_id?: number;
  state_id?: number;
  remarks?: string;
  convertedTo_tenant: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  rooms?: {
    s_no: number;
    room_no: string;
  };
  beds?: {
    s_no: number;
    bed_no: string;
  };
  city?: {
    s_no: number;
    city_name: string;
  };
  state?: {
    s_no: number;
    state_name: string;
  };
}

export interface CreateVisitorDto {
  visitor_name: string;
  phone_no: string;
  purpose?: string;
  visited_date?: string;
  visited_room_id?: number;
  visited_bed_id?: number;
  city_id?: number;
  state_id?: number;
  remarks?: string;
  convertedTo_tenant?: boolean;
}

export interface GetVisitorsParams {
  page?: number;
  limit?: number;
  search?: string;
  room_id?: number;
  converted_to_tenant?: boolean;
}

const visitorService = {
  async getAllVisitors(params: GetVisitorsParams = {}) {
    const response = await axiosInstance.get('/visitors', { params });
    return response.data;
  },

  async getVisitorById(id: number) {
    const response = await axiosInstance.get(`/visitors/${id}`);
    return response.data;
  },

  async createVisitor(data: CreateVisitorDto) {
    const response = await axiosInstance.post('/visitors', data);
    return response.data;
  },

  async updateVisitor(id: number, data: Partial<CreateVisitorDto>) {
    const response = await axiosInstance.patch(`/visitors/${id}`, data);
    return response.data;
  },

  async deleteVisitor(id: number) {
    const response = await axiosInstance.delete(`/visitors/${id}`);
    return response.data;
  },

  async getVisitorStats() {
    const response = await axiosInstance.get('/visitors/stats');
    return response.data;
  },
};

export default visitorService;
