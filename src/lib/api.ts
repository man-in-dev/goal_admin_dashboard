import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin-token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Form data types
export interface AdmissionEnquiry {
  _id: string
  name: string
  email: string
  phone: string
  course: string
  studyLevel: string
  address?: string
  message?: string
  status: 'pending' | 'contacted' | 'enrolled' | 'rejected'
  source?: string
  createdAt: string
  updatedAt: string
}

export interface ContactForm {
  _id: string
  name: string
  email: string
  phone: string
  state: string
  district: string
  subject: string
  message: string
  location?: string
  department?: string
  status: 'pending' | 'contacted' | 'resolved' | 'closed'
  source?: string
  createdAt: string
  updatedAt: string
}

// Note: GAETForm and GVETForm interfaces removed as GVET and GAET functionality has been removed

export interface EnquiryForm {
  _id: string
  name: string
  phone: string
  email: string
  studying: string
  course: string
  state: string
  district: string
  address: string
  query: string
  countryCode: string
  status: 'pending' | 'contacted' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface ComplaintFeedback {
  _id: string
  isGoalStudent: boolean
  uid?: string
  rollNo?: string
  name: string
  course?: string
  phone: string
  email: string
  type: 'complaint' | 'feedback' | 'suggestion'
  department: string
  message: string
  attachment?: string
  attachmentAlt?: string
  status: 'pending' | 'in_review' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

// API functions
export const formApi = {
  // Admission Enquiries
  getAdmissionEnquiries: async (params?: {
    page?: number
    limit?: number
    status?: string
    course?: string
  }) => {
    const response = await api.get('/admission/enquiries', { params })
    return response.data
  },

  updateAdmissionStatus: async (id: string, status: string) => {
    const response = await api.patch(`/admission/enquiries/${id}/status`, { status })
    return response.data
  },

  deleteAdmissionEnquiry: async (id: string) => {
    const response = await api.delete(`/admission/enquiries/${id}`)
    return response.data
  },

  getAdmissionStats: async () => {
    const response = await api.get('/admission/stats')
    return response.data
  },

  // Contact Forms
  getContactForms: async (params?: {
    page?: number
    limit?: number
    status?: string
    state?: string
  }) => {
    const response = await api.get('/contact/forms', { params })
    return response.data
  },

  updateContactStatus: async (id: string, status: string) => {
    const response = await api.patch(`/contact/forms/${id}/status`, { status })
    return response.data
  },

  deleteContactForm: async (id: string) => {
    const response = await api.delete(`/contact/forms/${id}`)
    return response.data
  },

  getContactStats: async () => {
    const response = await api.get('/contact/stats')
    return response.data
  },

  // Note: GAET and GVET form APIs removed as GVET and GAET functionality has been removed

  // Enquiry Forms
  getEnquiryForms: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) => {
    const response = await api.get('/enquiry', { params })
    return response.data
  },

  getEnquiryFormById: async (id: string) => {
    const response = await api.get(`/enquiry/${id}`)
    return response.data
  },

  updateEnquiryForm: async (id: string, data: Partial<EnquiryForm>) => {
    const response = await api.put(`/enquiry/${id}`, data)
    return response.data
  },

  deleteEnquiryForm: async (id: string) => {
    const response = await api.delete(`/enquiry/${id}`)
    return response.data
  },

  getEnquiryStats: async () => {
    const response = await api.get('/enquiry/stats')
    return response.data
  },

  downloadEnquiriesCSV: async (params?: {
    status?: string
    search?: string
  }) => {
    const response = await api.get('/enquiry/download-csv', { 
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Complaint & Feedback Forms
  getComplaintFeedbackForms: async (params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    search?: string
  }) => {
    const response = await api.get('/complaint-feedback', { params })
    return response.data
  },

  getComplaintFeedbackFormById: async (id: string) => {
    const response = await api.get(`/complaint-feedback/${id}`)
    return response.data
  },

  updateComplaintFeedbackForm: async (id: string, data: Partial<ComplaintFeedback>) => {
    const response = await api.put(`/complaint-feedback/${id}`, data)
    return response.data
  },

  deleteComplaintFeedbackForm: async (id: string) => {
    const response = await api.delete(`/complaint-feedback/${id}`)
    return response.data
  },

  getComplaintFeedbackStats: async () => {
    const response = await api.get('/complaint-feedback/stats')
    return response.data
  },

  downloadComplaintsFeedbackCSV: async (params?: {
    status?: string
    type?: string
    search?: string
  }) => {
    const response = await api.get('/complaint-feedback/download-csv', { 
      params,
      responseType: 'blob'
    })
    return response.data
  },
}

// Public Notice API
export interface PublicNotice {
  _id: string;
  title: string;
  description: string;
  publishDate: string;
  downloadLink?: string;
  isActive: boolean;
  isPublished: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'exam' | 'admission' | 'general' | 'academic' | 'other';
  tags: string[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const publicNoticeApi = {
  getPublicNotices: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    priority?: string;
    isActive?: boolean;
    isPublished?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/public-notice', { params })
    return response.data
  },

  getPublicNoticeById: async (id: string) => {
    const response = await api.get(`/public-notice/${id}`)
    return response.data
  },

  createPublicNotice: async (data: Partial<PublicNotice>) => {
    const response = await api.post('/public-notice', data)
    return response.data
  },

  updatePublicNotice: async (id: string, data: Partial<PublicNotice>) => {
    const response = await api.put(`/public-notice/${id}`, data)
    return response.data
  },

  deletePublicNotice: async (id: string) => {
    const response = await api.delete(`/public-notice/${id}`)
    return response.data
  },

  getPublicNoticeStats: async () => {
    const response = await api.get('/public-notice/stats')
    return response.data
  },
}

// News & Events API
export interface NewsEvent {
  _id: string;
  title: string;
  content: string;
  type: 'news' | 'event' | 'announcement';
  publishDate?: string;
  publishTime?: string;
  location?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const newsEventApi = {
  getNewsEvents: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/news-events', { params })
    return response.data
  },

  getNewsEventById: async (id: string) => {
    const response = await api.get(`/news-events/${id}`)
    return response.data
  },

  createNewsEvent: async (data: Partial<NewsEvent>) => {
    const response = await api.post('/news-events', data)
    return response.data
  },

  updateNewsEvent: async (id: string, data: Partial<NewsEvent>) => {
    const response = await api.put(`/news-events/${id}`, data)
    return response.data
  },

  deleteNewsEvent: async (id: string) => {
    const response = await api.delete(`/news-events/${id}`)
    return response.data
  },

  getNewsEventStats: async () => {
    const response = await api.get('/news-events/stats')
    return response.data
  },

  getRecentNewsEvents: async (params?: {
    limit?: number;
    type?: string;
  }) => {
    const response = await api.get('/news-events/recent', { params })
    return response.data
  },

  getNewsEventsByTags: async (tags: string[]) => {
    const response = await api.get('/news-events/tags', { 
      params: { tags: tags.join(',') }
    })
    return response.data
  },
}

// Dashboard stats API
export const dashboardApi = {
  getAllStats: async () => {
    try {
      const [
        enquiryStats,
        complaintStats,
        newsEventStats,
        publicNoticeStats,
        blogStats,
        resultStats
      ] = await Promise.all([
        formApi.getEnquiryStats(),
        formApi.getComplaintFeedbackStats(),
        newsEventApi.getNewsEventStats(),
        publicNoticeApi.getPublicNoticeStats(),
        blogApi.getBlogStats(),
        resultApi.getResultStats()
      ]);

      return {
        success: true,
        data: {
          enquiryForms: enquiryStats.success ? enquiryStats.data.total ? enquiryStats.data.total : 0 : 0,
          complaintsFeedback: complaintStats.success ? complaintStats.data.total : 0,
          newsEvents: newsEventStats.success ? newsEventStats.data.total : 0,
          publicNotices: publicNoticeStats.success ? publicNoticeStats.data.total : 0,
          blogs: blogStats.success ? blogStats.data.total : 0,
          results: resultStats.success ? resultStats.data.total : 0
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        data: {
          enquiryForms: 0,
          complaintsFeedback: 0,
          newsEvents: 0,
          publicNotices: 0,
          blogs: 0,
          results: 0
        }
      };
    }
  },

  getRecentActivity: async () => {
    try {
      // Get recent items from different modules
      const [recentEnquiries, recentComplaints, recentNews] = await Promise.all([
        formApi.getEnquiryForms({ limit: 2 }),
        formApi.getComplaintFeedbackForms({ limit: 2 }),
        newsEventApi.getNewsEvents({ limit: 2 })
      ]);

      const activities: Array<{
        id: string;
        type: string;
        name: string;
        email: string;
        time: string;
        status: string;
      }> = [];

      // Add recent enquiries
      if (recentEnquiries.success && recentEnquiries.data?.data) {
        recentEnquiries.data.data.forEach((item: any) => {
          activities.push({
            id: item._id,
            type: 'Enquiry Form',
            name: item.name || 'Anonymous',
            email: item.email || '',
            time: new Date(item.createdAt).toLocaleString(),
            status: item.status || 'pending'
          });
        });
      }

      // Add recent complaints
      if (recentComplaints.success && recentComplaints.data?.data) {
        recentComplaints.data.data.forEach((item: any) => {
          activities.push({
            id: item._id,
            type: 'Complaint',
            name: item.name || 'Anonymous',
            email: item.email || '',
            time: new Date(item.createdAt).toLocaleString(),
            status: item.status || 'pending'
          });
        });
      }

      // Add recent news
      if (recentNews.success && recentNews.data?.data) {
        recentNews.data.data.forEach((item: any) => {
          activities.push({
            id: item._id,
            type: 'News Article',
            name: 'Admin',
            email: 'admin@goal.com',
            time: new Date(item.createdAt).toLocaleString(),
            status: 'published'
          });
        });
      }

      // Sort by time and return latest 4
      return {
        success: true,
        data: activities
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 4)
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        success: false,
        data: []
      };
    }
  }
}

// Blog API
export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  imageAlt?: string;
  author: string;
  category: 'education' | 'career' | 'technology' | 'lifestyle' | 'general';
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishDate?: string;
  lastModified?: string;
  views: number;
  likes: number;
  comments: number;
  readingTime: number;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  seoKeywords?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  mobileImageUrl?: string;
  mobileImageAlt?: string;
  linkUrl?: string;
  position: 'hero' | 'sidebar' | 'footer' | 'popup';
  isActive: boolean;
  priority: number;
  targetAudience?: string[];
  clicks: number;
  impressions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const blogApi = {
  getBlogs: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/blog', { params })
    return response.data
  },

  getBlogById: async (id: string) => {
    const response = await api.get(`/blog/${id}`)
    return response.data
  },

  getBlogBySlug: async (slug: string) => {
    const response = await api.get(`/blog/slug/${slug}`)
    return response.data
  },

  createBlog: async (data: Partial<Blog>) => {
    const response = await api.post('/blog', data)
    return response.data
  },

  updateBlog: async (id: string, data: Partial<Blog>) => {
    const response = await api.put(`/blog/${id}`, data)
    return response.data
  },

  deleteBlog: async (id: string) => {
    const response = await api.delete(`/blog/${id}`)
    return response.data
  },

  toggleBlogPublish: async (id: string) => {
    const response = await api.patch(`/blog/${id}/toggle-publish`)
    return response.data
  },

  toggleBlogFeatured: async (id: string) => {
    const response = await api.patch(`/blog/${id}/toggle-featured`)
    return response.data
  },

  getFeaturedBlogs: async (limit?: number) => {
    const response = await api.get('/blog/featured', { params: { limit } })
    return response.data
  },

  getRecentBlogs: async (limit?: number, category?: string) => {
    const response = await api.get('/blog/recent', { params: { limit, category } })
    return response.data
  },

  getBlogsByCategory: async (category: string, limit?: number) => {
    const response = await api.get('/blog/category', { params: { category, limit } })
    return response.data
  },

  getBlogsByTags: async (tags: string[], limit?: number) => {
    const response = await api.get('/blog/tags', { params: { tags, limit } })
    return response.data
  },

  getPopularBlogs: async (limit?: number) => {
    const response = await api.get('/blog/popular', { params: { limit } })
    return response.data
  },

  getBlogStats: async () => {
    const response = await api.get('/blog/stats')
    return response.data
  }
}

// Banner API
export const bannerApi = {
  getBanners: async (params?: {
    page?: number
    limit?: number
    position?: string
    isActive?: boolean
    search?: string
  }) => {
    const response = await api.get('/banner', { params })
    return response.data
  },

  getAllBanners: async (params?: {
    page?: number
    limit?: number
    position?: string
    isActive?: boolean
    search?: string
  }) => {
    const response = await api.get('/banner', { params })
    return response.data
  },

  getBannerById: async (id: string) => {
    const response = await api.get(`/banner/${id}`)
    return response.data
  },

  createBanner: async (data: any) => {
    const response = await api.post('/banner', data)
    return response.data
  },

  updateBanner: async (id: string, data: any) => {
    const response = await api.put(`/banner/${id}`, data)
    return response.data
  },

  deleteBanner: async (id: string) => {
    const response = await api.delete(`/banner/${id}`)
    return response.data
  },

  toggleBannerStatus: async (id: string) => {
    const response = await api.patch(`/banner/${id}/toggle-status`)
    return response.data
  },

  getActiveBannersByPosition: async (position: string) => {
    const response = await api.get(`/banner/active/${position}`)
    return response.data
  },

  recordBannerClick: async (id: string) => {
    const response = await api.post(`/banner/${id}/click`)
    return response.data
  },

  recordBannerImpression: async (id: string) => {
    const response = await api.post(`/banner/${id}/impression`)
    return response.data
  },

  getBannerStats: async () => {
    const response = await api.get('/banner/stats')
    return response.data
  }
}

// Result API
export interface Result {
  _id: string;
  course: string;
  testDate: string;
  rank: number;
  rollNo: string;
  studentName: string;
  tq: number;
  ta: number;
  tr: number;
  tw: number;
  tl: number;
  pr: number;
  pw: number;
  cr: number;
  cw: number;
  br: number;
  bw: number;
  zr?: number;
  zw?: number;
  totalMarks: number;
  marksPercentage: number;
  wPercentage: number;
  percentile: number;
  batch: string;
  branch: string;
  uploadedBy: string;
  createdAt?: string;
  updatedAt: string;
  
  // New optional fields for filtering
  testType?: 'CLASSROOM_TEST' | 'SURPRISE_TEST' | 'MOCK_TEST' | 'FINAL_TEST';
  examId?: string;
  batchYear?: number;
  batchCode?: string;
  totalStudents?: number;
}

export const resultApi = {
  getResults: async (params?: {
    page?: number;
    limit?: number;
    course?: string;
    batch?: string;
    branch?: string;
    testDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    testType?: string;
    batchYear?: number;
    batchCode?: string;
  }) => {
    const response = await api.get('/result', { params })
    return response.data
  },

  getResultById: async (id: string) => {
    const response = await api.get(`/result/${id}`)
    return response.data
  },

  createResult: async (data: Partial<Result>) => {
    const response = await api.post('/result', data)
    return response.data
  },

  updateResult: async (id: string, data: Partial<Result>) => {
    const response = await api.put(`/result/${id}`, data)
    return response.data
  },

  deleteResult: async (id: string) => {
    const response = await api.delete(`/result/${id}`)
    return response.data
  },

  deleteMultipleResults: async (ids: string[]) => {
    const response = await api.delete('/result/multiple', { data: { ids } })
    return response.data
  },

  uploadCSVResults: async (file: File, uploadedBy: string) => {
    const formData = new FormData()
    formData.append('csvFile', file)
    formData.append('uploadedBy', uploadedBy)
    
    const response = await api.post('/result/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getResultStats: async () => {
    const response = await api.get('/result/stats')
    return response.data
  },

  getResultsByCourse: async (course: string, params?: {
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/result/course/${course}`, { params })
    return response.data
  },

  getResultsByBatch: async (batch: string, params?: {
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/result/batch/${batch}`, { params })
    return response.data
  }
}

export interface GVETAnswerKey {
  _id: string
  name: string
  rollNo: string
  phone: string
  questionNo: string
  explanation: string
  createdAt: string
  updatedAt: string
}

export const gvetAdminApi = {
  getAnswerKeys: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get('/gvet/answer-key', { params })
    return response.data
  },

  deleteAnswerKey: async (id: string) => {
    const response = await api.delete(`/gvet/answer-key/${id}`)
    return response.data
  },
}

// GAET Results API
export interface GAETResult {
  _id?: string;
  rollNo: string;
  studentName: string;
  testName: string;
  tq: number;
  tr: number;
  tw: number;
  tl: number;
  pr: number;
  pw: number;
  cr: number;
  cw: number;
  mr: number;
  mw: number;
  br: number;
  bw: number;
  gkr: number;
  gkw: number;
  totalMarks: number;
  marksPercentage: number;
  scholarship?: string;
  specialDiscount?: string;
  totalFeeOneTime?: number;
  scholarshipAmount?: number;
  totalFeeInstallment?: number;
  scholarshipAmountInstallment?: number;
  testDate: string;
  testCenter?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const gaetResultsApi = {
  getGAETResults: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    testName?: string;
    testCenter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/gaet-results', { params })
    return response.data
  },

  getGAETResultById: async (id: string) => {
    const response = await api.get(`/gaet-results/${id}`)
    return response.data
  },

  createGAETResult: async (data: Partial<GAETResult>) => {
    const response = await api.post('/gaet-results', data)
    return response.data
  },

  updateGAETResult: async (id: string, data: Partial<GAETResult>) => {
    const response = await api.put(`/gaet-results/${id}`, data)
    return response.data
  },

  deleteGAETResult: async (id: string) => {
    const response = await api.delete(`/gaet-results/${id}`)
    return response.data
  },

  deleteMultipleGAETResults: async (ids: string[]) => {
    const response = await api.delete('/gaet-results/multiple', { data: { ids } })
    return response.data
  },

  uploadCSVGAETResults: async (file: File) => {
    const formData = new FormData()
    formData.append('csvFile', file)
    
    const response = await api.post('/gaet-results/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getGAETResultStats: async () => {
    const response = await api.get('/gaet-results/stats')
    return response.data
  },
}

// GAET Date API
export interface GAETDate {
  _id: string;
  date: string;
  mode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const gaetDateApi = {
  getGAETDates: async (params?: {
    isActive?: boolean;
  }) => {
    const response = await api.get('/gaet-dates', { params })
    return response.data
  },

  getGAETDateById: async (id: string) => {
    const response = await api.get(`/gaet-dates/${id}`)
    return response.data
  },

  createGAETDate: async (data: Partial<GAETDate>) => {
    const response = await api.post('/gaet-dates', data)
    return response.data
  },

  updateGAETDate: async (id: string, data: Partial<GAETDate>) => {
    const response = await api.put(`/gaet-dates/${id}`, data)
    return response.data
  },

  deleteGAETDate: async (id: string) => {
    const response = await api.delete(`/gaet-dates/${id}`)
    return response.data
  },
}

// AITS Video Solution API
export interface AITSVideoSolution {
  _id: string;
  testName: string;
  subject: string;
  videoLink?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const aitsVideoSolutionApi = {
  getAITSVideoSolutions: async (params?: {
    activeOnly?: boolean;
  }) => {
    const response = await api.get('/aits-video-solutions', { params })
    return response.data
  },

  getAITSVideoSolutionById: async (id: string) => {
    const response = await api.get(`/aits-video-solutions/${id}`)
    return response.data
  },

  createAITSVideoSolution: async (data: Partial<AITSVideoSolution>) => {
    const response = await api.post('/aits-video-solutions', data)
    return response.data
  },

  updateAITSVideoSolution: async (id: string, data: Partial<AITSVideoSolution>) => {
    const response = await api.put(`/aits-video-solutions/${id}`, data)
    return response.data
  },

  deleteAITSVideoSolution: async (id: string) => {
    const response = await api.delete(`/aits-video-solutions/${id}`)
    return response.data
  },

  bulkDeleteAITSVideoSolutions: async (ids: string[]) => {
    const response = await api.delete('/aits-video-solutions', { data: { ids } })
    return response.data
  },
}

// Course API
export interface Course {
  _id: string;
  title: string;
  description: string;
  category: 'Medical Courses' | 'Engineering Courses' | 'Pre-Foundation Course';
  icon?: string;
  order: number;
  isActive: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const courseApi = {
  getCourses: async (params?: {
    category?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  getCourseBySlug: async (slug: string) => {
    const response = await api.get(`/courses/slug/${slug}`);
    return response.data;
  },

  createCourse: async (data: Partial<Course>) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
}

// Admission Form API
export interface AdmissionForm {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  applicationNo?: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  category: string;
  nationality: string;
  motherTongue?: string;
  alternateContact: string;
  pinCode?: string;
  passportPhoto?: string;
  fatherName: string;
  fatherMobile: string;
  fatherWhatsApp: string;
  fatherOccupation: string;
  motherName: string;
  motherMobile: string;
  motherOccupation: string;
  annualFamilyIncome: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianWhatsApp?: string;
  guardianRelationship?: string;
  previousClass: string;
  previousSchool: string;
  previousBoard: string;
  previousYear: string;
  previousMarks: string;
  previousGrade?: string;
  classSeekingAdmission: string;
  preferredTestDate: string;
  preferredTestCentre: string;
  reportCard?: string;
  birthCertificate?: string;
  idProof?: string;
  declarationAccepted: boolean;
  parentGuardianName: string;
  declarationDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'admitted';
  createdAt: string;
  updatedAt: string;
}

export const admissionFormApi = {
  getAdmissionForms: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    classSeekingAdmission?: string;
    search?: string;
  }) => {
    const response = await api.get('/admission-form', { params });
    return response.data;
  },

  getAdmissionFormById: async (id: string) => {
    const response = await api.get(`/admission-form/${id}`);
    return response.data;
  },

  updateAdmissionFormStatus: async (id: string, status: string) => {
    const response = await api.patch(`/admission-form/${id}/status`, { status });
    return response.data;
  },

  deleteAdmissionForm: async (id: string) => {
    const response = await api.delete(`/admission-form/${id}`);
    return response.data;
  },
}

// Chat Message API
export interface ChatMessage {
  _id: string;
  sessionId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  message: string;
  response?: string;
  role: 'user' | 'assistant';
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    pageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getChatMessages: async (params?: {
    page?: number;
    limit?: number;
    sessionId?: string;
    role?: string;
    search?: string;
  }) => {
    const response = await api.get('/chat/messages', { params });
    // Backend wraps payload as { success, message, data: { ... } }
    return response.data.data;
  },

  getChatMessagesBySession: async (sessionId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/chat/messages/${sessionId}`, { params });
    return response.data.data;
  },

  getStatsByDevice: async (deviceId: string) => {
    const response = await api.get(`/chat/messages/device/${deviceId}`);
    return response.data.data;
  },

  deleteChatMessage: async (id: string) => {
    const response = await api.delete(`/chat/messages/${id}`);
    return response.data;
  },

  deleteChatSession: async (sessionId: string) => {
    const response = await api.delete(`/chat/messages/session/${sessionId}`);
    return response.data;
  },
}