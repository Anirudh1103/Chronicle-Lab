import axios from 'axios';
import { Post, PostMetadata, EditorBlock, SEOMetadata } from '../types/editor';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const blogApi = {
  createPost: async (data: any) => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: any) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await api.get(`/posts/id/${id}`);
    return response.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await api.get(`/posts/${slug}`);
    return response.data;
  },

  getAllPosts: async (status?: string) => {
    const response = await api.get(`/posts${status ? `?status=${status}` : ''}`);
    return response.data;
  },

  searchPosts: async (query: string) => {
    const response = await api.get(`/posts/search?q=${query}`);
    return response.data;
  },

  reactToPost: async (id: string, type: string) => {
    const response = await api.post(`/posts/${id}/react`, { type });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/posts/stats');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  subscribe: async (email: string) => {
    const response = await api.post('/auth/subscribe', { email });
    return response.data;
  },

  submitFeedback: async (data: { name: string; email: string; message: string; type: string }) => {
    const response = await api.post('/auth/feedback', data);
    return response.data;
  },
};
