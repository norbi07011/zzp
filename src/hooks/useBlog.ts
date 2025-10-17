// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as blogService from '../services/blog';
import type { BlogPost, BlogCategory, BlogAuthor, BlogStats, PostStatus } from '../services/blog';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const archivedPosts = posts.filter(p => p.status === 'archived');
  const totalViews = posts.reduce((sum, p) => sum + p.view_count, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comment_count, 0);

  // Fetch all posts
  const fetchPosts = useCallback(async (status?: PostStatus) => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.fetchAllPosts(status);
      setPosts(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await blogService.fetchAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch authors
  const fetchAuthors = useCallback(async () => {
    try {
      const data = await blogService.fetchAllAuthors();
      setAuthors(data);
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await blogService.getBlogStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching blog stats:', err);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (postData: Partial<BlogPost>) => {
    try {
      setError(null);
      const newPost = await blogService.createPost(postData);
      setPosts(prev => [newPost, ...prev]);
      await fetchStats();
      return newPost;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update post
  const updatePost = useCallback(async (id: string, updates: Partial<BlogPost>) => {
    try {
      setError(null);
      const updated = await blogService.updatePost(id, updates);
      setPosts(prev => prev.map(p => p.id === id ? updated : p));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Delete post
  const deletePost = useCallback(async (id: string) => {
    try {
      setError(null);
      await blogService.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Publish post
  const publishPost = useCallback(async (id: string) => {
    try {
      setError(null);
      const published = await blogService.publishPost(id);
      setPosts(prev => prev.map(p => p.id === id ? published : p));
      await fetchStats();
      return published;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Create category
  const createCategory = useCallback(async (categoryData: Partial<BlogCategory>) => {
    try {
      setError(null);
      const newCategory = await blogService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Update category
  const updateCategory = useCallback(async (id: string, updates: Partial<BlogCategory>) => {
    try {
      setError(null);
      const updated = await blogService.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await blogService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Search posts
  const searchPosts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogService.searchPosts(query);
      setPosts(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (ids: string[], status: PostStatus) => {
    try {
      setError(null);
      await blogService.bulkUpdatePostStatus(ids, status);
      await fetchPosts();
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchPosts, fetchStats]);

  // Bulk delete
  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      await blogService.bulkDeletePosts(ids);
      setPosts(prev => prev.filter(p => !ids.includes(p.id)));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Initial load
  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchAuthors();
    fetchStats();
  }, [fetchPosts, fetchCategories, fetchAuthors, fetchStats]);

  return {
    // State
    posts,
    categories,
    authors,
    stats,
    loading,
    error,

    // Computed
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalViews,
    totalComments,

    // Methods
    fetchPosts,
    fetchCategories,
    fetchAuthors,
    fetchStats,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    createCategory,
    updateCategory,
    deleteCategory,
    searchPosts,
    bulkUpdateStatus,
    bulkDelete,
  };
}
