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
  togglePostVisibility: async (id: string) => {
    const response = await api.patch(`/posts/${id}/visibility`);
    return response.data;
  },


  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
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

  // Settings & Config
  getQuotes: async () => {
    const response = await api.get('/settings/quotes');
    return response.data;
  },

  addQuote: async (data: { text: string; author: string; category: string }) => {
    const response = await api.post('/settings/quotes', data);
    return response.data;
  },

  deleteQuote: async (id: string) => {
    const response = await api.delete(`/settings/quotes/${id}`);
    return response.data;
  },

  getConfig: async () => {
    const response = await api.get('/settings/config');
    return response.data;
  },

  updateConfig: async (configs: Record<string, string>) => {
    const response = await api.post('/settings/config', configs);
    return response.data;
  },
};
