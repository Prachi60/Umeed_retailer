import api from "../config";
import { ApiResponse } from "./types";

export interface Policy {
  _id: string;
  type: "customer" | "delivery" | "privacy_policy" | "terms_and_conditions" | "about_us" | "rider_about_us";
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  updatedAt: string;
}

export const getPolicies = async (params?: any): Promise<ApiResponse<Policy[]>> => {
  const response = await api.get<ApiResponse<Policy[]>>("/admin/policies", { params });
  return response.data;
};

export const upsertPolicy = async (data: Partial<Policy>): Promise<ApiResponse<Policy>> => {
  const response = await api.post<ApiResponse<Policy>>("/admin/policies/upsert", data);
  return response.data;
};

export const deletePolicy = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/admin/policies/${id}`);
  return response.data;
};
