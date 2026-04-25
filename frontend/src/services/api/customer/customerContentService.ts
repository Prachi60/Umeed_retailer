import api from "../config";
import { ApiResponse } from "../admin/types";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Fetch public FAQs for customers
 */
export const getPublicFAQs = async (): Promise<ApiResponse<FAQItem[]>> => {
  const response = await api.get<ApiResponse<FAQItem[]>>("/customer/home/faqs");
  return response.data;
};
