import axiosInstance from '../core/axiosInstance';

export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
  pg_id?: number;
  gender?: UserGender;
  address?: string;
  city_id?: number;
  state_id?: number;
  pincode?: string;
  country?: string;
  proof_documents?: string[];
  profile_images?: string[];
}

export interface UpdateEmployeeDto {
  name?: string;
  phone?: string;
  role_id?: number;
  pg_id?: number;
  gender?: UserGender;
  address?: string;
  city_id?: number;
  state_id?: number;
  pincode?: string;
  country?: string;
  proof_documents?: string[];
  profile_images?: string[];
}

export interface Employee {
  s_no: number;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  role_id: number;
  pg_id?: number;
  organization_id?: number;
  gender?: UserGender;
  address?: string;
  city_id?: number;
  state_id?: number;
  pincode?: string;
  country?: string;
  proof_documents?: any;
  profile_images?: any;
  created_at: string;
  updated_at: string;
  roles?: {
    s_no: number;
    role_name: string;
  };
  city?: {
    s_no: number;
    name: string;
  };
  state?: {
    s_no: number;
    name: string;
  };
}

const employeeService = {
  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeeDto): Promise<any> {
    const response = await axiosInstance.post('/employees', data);
    return response.data;
  },

  /**
   * Get all employees
   */
  async getEmployees(
    page: number = 1,
    limit: number = 10,
    pg_id?: number,
    role_id?: number,
    search?: string,
  ): Promise<any> {
    const response = await axiosInstance.get('/employees', {
      params: { page, limit, pg_id, role_id, search },
    });
    return response.data;
  },

  /**
   * Get a single employee by ID
   */
  async getEmployeeById(id: number): Promise<any> {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  },

  /**
   * Update an employee
   */
  async updateEmployee(id: number, data: UpdateEmployeeDto): Promise<any> {
    const response = await axiosInstance.patch(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Delete an employee (soft delete)
   */
  async deleteEmployee(id: number): Promise<any> {
    const response = await axiosInstance.delete(`/employees/${id}`);
    return response.data;
  },

  /**
   * Get employee statistics
   */
  async getEmployeeStats(pg_id?: number): Promise<any> {
    const response = await axiosInstance.get('/employees/stats', {
      params: { pg_id },
    });
    return response.data;
  },
};

export default employeeService;
