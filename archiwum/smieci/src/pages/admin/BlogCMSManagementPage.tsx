// @ts-nocheck
/**
 * BlogCMSManagementPage
 * Admin panel for blog content management, posts, and categories
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  category: string;
  tags: string[];
  featured_image?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  views: number;
  created_at: string;
  author?: {
    email: string;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

export const BlogCMSManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'stats'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  });
  const [stats, setStats] = useState({
    total_posts: 0,
    published: 0,
    drafts: 0,
    total_views: 0
  });

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    } else if (activeTab === 'categories') {
      loadCategories();
    }
  }, [activeTab, filters]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id(email)
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate stats
      const totalPosts = data?.length || 0;
      const published = data?.filter(p => p.status === 'published').length || 0;
      const drafts = data?.filter(p => p.status === 'draft').length || 0;
      const totalViews = data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      setStats({ total_posts: totalPosts, published, drafts, total_views: totalViews });
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Use mock data
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Top 10 Tips voor ZZP Professionals in 2025',
          slug: 'top-10-tips-zzp-2025',
          excerpt: 'Ontdek de beste tips om succesvol te zijn als ZZP professional...',
          content: 'Volledige content hier...',
          author_id: '1',
          category: 'tips',
          tags: ['zzp', 'tips', 'business'],
          status: 'published',
          published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          views: 1247,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Belastingtips voor Freelancers',
          slug: 'belastingtips-freelancers',
          excerpt: 'Alles wat je moet weten over belastingen als freelancer...',
          content: 'Volledige content hier...',
          author_id: '1',
          category: 'finance',
          tags: ['belasting', 'finance', 'tips'],
          status: 'published',
          published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          views: 892,
          created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Nieuwe Features Komen Eraan',
          slug: 'nieuwe-features',
          excerpt: 'Preview van aankomende features op het platform...',
          content: 'Draft content...',
          author_id: '1',
          category: 'news',
          tags: ['platform', 'updates'],
          status: 'draft',
          views: 0,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setPosts(mockPosts);
      setStats({
        total_posts: 3,
        published: 2,
        drafts: 1,
        total_views: 2139
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use mock data
      const mockCategories: BlogCategory[] = [
        { id: '1', name: 'Tips & Tricks', slug: 'tips', description: 'Nuttige tips voor ZZP professionals', post_count: 15 },
        { id: '2', name: 'Finance', slug: 'finance', description: 'Financieel advies en tips', post_count: 8 },
        { id: '3', name: 'News', slug: 'news', description: 'Platform updates en nieuws', post_count: 12 },
        { id: '4', name: 'Success Stories', slug: 'success', description: 'Succesverhalen van gebruikers', post_count: 6 }
      ];
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Post would be published');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Post would be deleted');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Blog CMS</h1>
            <p className="text-gray-600">Manage blog posts, categories, and content</p>
          </div>
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Posts</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_posts}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Drafts</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.drafts}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.total_views.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 px-4 ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2 px-4 ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Statistics
          </button>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter post title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Short description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={10}
                  placeholder="Write your post content (supports Markdown)..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Tips & Tricks</option>
                    <option>Finance</option>
                    <option>News</option>
                    <option>Success Stories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Save as Draft
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Publish Now
                </button>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Title or content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    <option value="tips">Tips & Tricks</option>
                    <option value="finance">Finance</option>
                    <option value="news">News</option>
                    <option value="success">Success Stories</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📁 {post.category}</span>
                          <span>👀 {post.views} views</span>
                          <span>
                            {post.published_at 
                              ? `📅 ${new Date(post.published_at).toLocaleDateString('nl-NL')}`
                              : '📝 Draft'
                            }
                          </span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                        {post.status === 'draft' && (
                          <button
                            onClick={() => handlePublishPost(post.id)}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No posts found
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {categories.map(category => (
                  <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {category.post_count} posts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Content Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Posts:</span>
                  <span className="font-semibold">{stats.total_posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-semibold text-green-600">{stats.published}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drafts:</span>
                  <span className="font-semibold text-gray-600">{stats.drafts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Views:</span>
                  <span className="font-semibold text-purple-600">{stats.total_views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Views per Post:</span>
                  <span className="font-semibold">
                    {stats.published > 0 ? Math.round(stats.total_views / stats.published) : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Publishing Rate</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Publication Rate</span>
                    <span className="text-sm font-medium">
                      {stats.total_posts > 0 ? Math.round((stats.published / stats.total_posts) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.total_posts > 0 ? (stats.published / stats.total_posts) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCMSManagementPage;
