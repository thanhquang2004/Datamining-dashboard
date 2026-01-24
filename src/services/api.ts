import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getSkills: (limit = 20, source?: string) =>
    api.get("/dashboard/skills", { params: { limit, source } }),
  getLocations: (limit = 20, source?: string) =>
    api.get("/dashboard/locations", { params: { limit, source } }),
  getCompanies: (limit = 20, source?: string) =>
    api.get("/dashboard/companies", { params: { limit, source } }),
  getSalary: (source?: string) =>
    api.get("/dashboard/salary", { params: { source } }),
  getTrends: (days = 30) => api.get("/dashboard/trends", { params: { days } }),
  getLevels: (source?: string) =>
    api.get("/dashboard/levels", { params: { source } }),
  getJobTypes: (source?: string) =>
    api.get("/dashboard/job-types", { params: { source } }),
  getJobs: (params: {
    skip?: number;
    limit?: number;
    source?: string;
    location?: string;
    level?: string;
    search?: string;
  }) => api.get("/dashboard/jobs", { params }),
};

// Crawler endpoints
export const crawlerApi = {
  getSources: () => api.get("/sources"),
  startCrawl: (data: {
    source: string;
    keywords?: string[];
    location?: string;
    pages?: number;
    headless?: boolean;
  }) => api.post("/crawl", data),
  getJobStatus: (jobId: string) => api.get(`/jobs/${jobId}`),
  listJobs: (params?: {
    limit?: number;
    offset?: number;
    source?: string;
    status?: string;
  }) => api.get("/jobs", { params }),
  cancelJob: (jobId: string) => api.delete(`/jobs/${jobId}`),
};

// JobsIT endpoints
export const jobsITApi = {
  getStats: () => api.get("/dashboard/jobs-it/stats"),
  getSkills: (limit = 20, source?: string) =>
    api.get("/dashboard/jobs-it/skills", { params: { limit, source } }),
  getLocations: (limit = 20, source?: string) =>
    api.get("/dashboard/jobs-it/locations", { params: { limit, source } }),
  getCompanies: (limit = 20, source?: string) =>
    api.get("/dashboard/jobs-it/companies", { params: { limit, source } }),
  getLevels: (source?: string) =>
    api.get("/dashboard/jobs-it/levels", { params: { source } }),
  getPredictions: (source?: string) =>
    api.get("/dashboard/jobs-it/predictions", { params: { source } }),
  getExperience: (source?: string) =>
    api.get("/dashboard/jobs-it/experience", { params: { source } }),
  getJobs: (params: {
    skip?: number;
    limit?: number;
    source?: string;
    location?: string;
    level?: string;
    pred?: number;
    search?: string;
  }) => api.get("/dashboard/jobs-it", { params }),
};

export default api;
