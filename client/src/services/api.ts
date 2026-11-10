import axios from 'axios';
import { Product, Category, Brand, Banner, Testimonial } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface ProductQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  latestArrival?: boolean;
  specialOffer?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getProducts = async (params: ProductQueryParams = {}): Promise<ProductsResponse> => {
  const response = await apiClient.get<ProductsResponse>('/products', { params });
  return response.data;
};

export const getProductByIdentifier = async (identifier: string): Promise<Product> => {
  const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${identifier}`);
  return response.data.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<{ success: boolean; data: Category[] }>('/categories');
  return response.data.data;
};

export const getBrands = async (featured?: boolean): Promise<Brand[]> => {
  const response = await apiClient.get<{ success: boolean; data: Brand[] }>('/brands', {
    params: featured ? { featured: true } : {},
  });
  return response.data.data;
};

export const getBanners = async (): Promise<Banner[]> => {
  const response = await apiClient.get<{ success: boolean; data: Banner[] }>('/banners');
  return response.data.data;
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const response = await apiClient.get<{ success: boolean; data: Testimonial[] }>('/testimonials');
  return response.data.data;
};

export const subscribeNewsletter = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>('/newsletter/subscribe', { email });
  return response.data;
};

