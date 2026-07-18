import axios from 'axios';
import { Post, PostMetadata, EditorBlock, SEOMetadata } from '../types/editor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

  likePost: async (id: string) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  dislikePost: async (id: string) => {
    const response = await api.post(`/posts/${id}/dislike`);
    return response.data;
  },

  sharePost: async (id: string) => {
    const response = await api.post(`/posts/${id}/share`);
    return response.data;
  },

  getComments: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (postId: string, payload: { authorName: string; authorEmail: string; content: string }) => {
    const response = await api.post(`/posts/${postId}/comments`, payload);
    return response.data;
  },

  getAllComments: async () => {
    const response = await api.get('/posts/admin/comments');
    return response.data;
  },

  deleteComment: async (id: string) => {
    const response = await api.delete(`/posts/admin/comments/${id}`);
    return response.data;
  },

  toggleCommentVisibility: async (id: string) => {
    const response = await api.patch(`/posts/admin/comments/${id}/visibility`);
    return response.data;
  },

  replyToComment: async (id: string, reply: string) => {
    const response = await api.patch(`/posts/admin/comments/${id}/reply`, { reply });
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

  createCategory: async (data: { name: string; slug: string }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  subscribe: async (email: string) => {
    const response = await api.post('/newsletter/subscribe', { email });
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

  updateQuote: async (id: string, data: any) => {
    const response = await api.put(`/settings/quotes/${id}`, data);
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

  verifyNewsletter: async (token: string) => {
    const response = await api.post('/newsletter/verify', { token });
    return response.data;
  },

  unsubscribeNewsletter: async (token: string) => {
    const response = await api.post('/newsletter/unsubscribe', { token });
    return response.data;
  },

  getGlossary: async () => {
    const response = await api.get('/glossary');
    return response.data;
  },

  saveGlossary: async (payload: any) => {
    const response = await api.post('/glossary', payload);
    return response.data;
  },

  deleteGlossary: async (id: string) => {
    const response = await api.delete(`/glossary/${id}`);
    return response.data;
  },
};
