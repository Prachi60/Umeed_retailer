import api from "./config";
import { ApiResponse } from "./admin/types";
import { Policy } from "./admin/adminPolicyService";

export const getPolicyByType = async (type: string): Promise<ApiResponse<Policy>> => {
  const response = await api.get<ApiResponse<Policy>>(`/policies/${type}`);
  return response.data;
};

export const getAllPolicies = async (): Promise<ApiResponse<Policy[]>> => {
  const response = await api.get<ApiResponse<Policy[]>>("/policies");
  return response.data;
};
