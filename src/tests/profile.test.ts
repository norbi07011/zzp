/**
 * Profile Service Tests
 * Unit tests for profile management functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  getWorkerProfile,
  updateWorkerProfile,
  updateWorkerSkills,
  getCompanyProfile,
  updateCompanyProfile,
  verifyCompanyKvK,
  uploadAvatar,
  deleteAvatar
} from '../services/profile';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn()
    }
  }
}));

describe('ProfileService - Worker Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch worker profile successfully', async () => {
    const mockWorker = {
      id: '1',
      user_id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      specialization: 'Developer',
      skills: ['React', 'TypeScript'],
      profile: { id: '1', email: 'john@example.com' }
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockWorker,
          error: null
        })
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    const result = await getWorkerProfile('user-1');

    expect(result).toBeDefined();
    expect(result?.first_name).toBe('John');
    expect(result?.skills).toEqual(['React', 'TypeScript']);
    expect(result?.completion_percentage).toBeGreaterThan(0);
  });

  it('should update worker profile successfully', async () => {
    const mockUpdated = {
      id: '1',
      user_id: 'user-1',
      first_name: 'Jane',
      last_name: 'Doe',
      skills: ['React'],
      profile: {}
    };

    const mockSelect = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: mockUpdated,
        error: null
      })
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: mockSelect
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate
    } as any);

    const result = await updateWorkerProfile('user-1', {
      first_name: 'Jane'
    });

    expect(result).toBeDefined();
    expect(result?.first_name).toBe('Jane');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should update worker skills successfully', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate
    } as any);

    await expect(
      updateWorkerSkills('user-1', ['React', 'TypeScript', 'Node.js'])
    ).resolves.not.toThrow();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ['React', 'TypeScript', 'Node.js']
      })
    );
  });
});

describe('ProfileService - Company Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch company profile successfully', async () => {
    const mockCompany = {
      id: '1',
      user_id: 'user-1',
      company_name: 'Test BV',
      company_nip: '12345678',
      is_verified: true,
      profile: { id: '1', email: 'company@example.com' }
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockCompany,
          error: null
        })
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    const result = await getCompanyProfile('user-1');

    expect(result).toBeDefined();
    expect(result?.company_name).toBe('Test BV');
    expect(result?.kvk_verified).toBe(true);
    expect(result?.completion_percentage).toBeGreaterThan(0);
  });

  it('should update company profile successfully', async () => {
    const mockUpdated = {
      id: '1',
      user_id: 'user-1',
      company_name: 'Updated BV',
      is_verified: false,
      profile: {}
    };

    const mockSelect = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: mockUpdated,
        error: null
      })
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: mockSelect
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate
    } as any);

    const result = await updateCompanyProfile('user-1', {
      company_name: 'Updated BV'
    });

    expect(result).toBeDefined();
    expect(result?.company_name).toBe('Updated BV');
  });

  it('should verify KvK number successfully', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: mockUpdate
    } as any);

    const result = await verifyCompanyKvK('user-1', '12345678');

    expect(result).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        company_nip: '12345678',
        is_verified: true
      })
    );
  });
});

describe('ProfileService - Avatar Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload avatar successfully', async () => {
    const mockFile = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
    const mockPath = 'user-1/worker/123456.jpg';
    const mockUrl = 'https://example.com/avatars/' + mockPath;

    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: mockPath },
      error: null
    });

    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: mockUrl }
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    } as any);

    const result = await uploadAvatar(mockFile, 'user-1', 'worker');

    expect(result.url).toBe(mockUrl);
    expect(result.path).toBe(mockPath);
    expect(mockUpload).toHaveBeenCalled();
  });

  it('should reject files larger than 5MB', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });

    await expect(
      uploadAvatar(largeFile, 'user-1', 'worker')
    ).rejects.toThrow('File size exceeds 5MB limit');
  });

  it('should reject invalid file types', async () => {
    const invalidFile = new File(['test'], 'file.pdf', {
      type: 'application/pdf'
    });

    await expect(
      uploadAvatar(invalidFile, 'user-1', 'worker')
    ).rejects.toThrow('Invalid file type');
  });

  it('should delete avatar successfully', async () => {
    const mockRemove = vi.fn().mockResolvedValue({
      data: null,
      error: null
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      remove: mockRemove
    } as any);

    await expect(
      deleteAvatar('user-1/worker/123456.jpg')
    ).resolves.not.toThrow();

    expect(mockRemove).toHaveBeenCalledWith(['user-1/worker/123456.jpg']);
  });
});

describe('ProfileService - Completion Calculation', () => {
  it('should calculate worker profile completion correctly', async () => {
    const completeWorker = {
      id: '1',
      user_id: 'user-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+31612345678',
      city: 'Amsterdam',
      specialization: 'Developer',
      bio: 'Experienced developer',
      hourly_rate: 75,
      avatar_url: 'https://example.com/avatar.jpg',
      skills: ['React', 'TypeScript'],
      years_of_experience: 5,
      availability_status: 'available',
      profile: {}
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: completeWorker,
          error: null
        })
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    const result = await getWorkerProfile('user-1');

    expect(result?.completion_percentage).toBe(100);
  });

  it('should calculate company profile completion correctly', async () => {
    const incompleteCompany = {
      id: '1',
      user_id: 'user-1',
      company_name: 'Test BV',
      is_verified: false,
      profile: {}
    };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: incompleteCompany,
          error: null
        })
      })
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect
    } as any);

    const result = await getCompanyProfile('user-1');

    expect(result?.completion_percentage).toBeLessThan(100);
  });
});
