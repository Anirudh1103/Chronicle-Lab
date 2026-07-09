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

  getAllPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
};
