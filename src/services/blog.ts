// @ts-nocheck
import { supabase } from '@/lib/supabase';

// Types
export type PostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_id: string;
  author_name?: string;
  category_id?: string;
  category_name?: string;
  tags: string[];
  status: PostStatus;
  published_at?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  reading_time_minutes: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  post_count: number;
  created_at: string;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  total_comments: number;
  total_categories: number;
}

// Posts
export async function fetchAllPosts(status?: PostStatus) {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as BlogPost[];
}

export async function fetchPostById(id: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function createPost(post: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{ 
      ...post, 
      view_count: 0, 
      like_count: 0, 
      comment_count: 0 
    }])
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function updatePost(id: string, updates: Partial<BlogPost>) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function deletePost(id: string) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function publishPost(id: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ 
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function incrementViewCount(id: string) {
  const { data, error } = await supabase
    .rpc('increment_post_views', { post_id: id });

  if (error) throw error;
  return data;
}

// Categories
export async function fetchAllCategories() {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as BlogCategory[];
}

export async function createCategory(category: Partial<BlogCategory>) {
  const { data, error } = await supabase
    .from('blog_categories')
    .insert([{ ...category, post_count: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data as BlogCategory;
}

export async function updateCategory(id: string, updates: Partial<BlogCategory>) {
  const { data, error } = await supabase
    .from('blog_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogCategory;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('blog_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Authors
export async function fetchAllAuthors() {
  const { data, error } = await supabase
    .from('blog_authors')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as BlogAuthor[];
}

// Stats
export async function getBlogStats(): Promise<BlogStats> {
  const [posts, categories] = await Promise.all([
    fetchAllPosts(),
    fetchAllCategories()
  ]);

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const totalViews = posts.reduce((sum, p) => sum + p.view_count, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comment_count, 0);

  return {
    total_posts: posts.length,
    published_posts: published,
    draft_posts: drafts,
    total_views: totalViews,
    total_comments: totalComments,
    total_categories: categories.length
  };
}

// Search
export async function searchPosts(query: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BlogPost[];
}

// Bulk operations
export async function bulkUpdatePostStatus(ids: string[], status: PostStatus) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ status })
    .in('id', ids)
    .select();

  if (error) throw error;
  return data as BlogPost[];
}

export async function bulkDeletePosts(ids: string[]) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
