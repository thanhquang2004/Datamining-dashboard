// Dashboard Types

export interface DashboardStats {
  total_jobs: number;
  active_jobs: number;
  inactive_jobs: number;
  jobs_by_source: Record<string, number>;
  remote_jobs: number;
  onsite_jobs: number;
  jobs_with_salary: number;
  average_salary: number | null;
  last_updated: string;
}

export interface SkillData {
  skill: string;
  count: number;
}

export interface SkillsAnalytics {
  top_required_skills: SkillData[];
  top_preferred_skills: SkillData[];
  top_all_skills: SkillData[];
  total_unique_skills: number;
}

export interface LocationData {
  location: string;
  count: number;
}

export interface LocationsAnalytics {
  locations: LocationData[];
  total_locations: number;
}

export interface CompanyData {
  company: string;
  job_count: number;
  avg_rating: number | null;
}

export interface CompaniesAnalytics {
  companies: CompanyData[];
}

export interface SalaryRange {
  range: string;
  count: number;
}

export interface SalaryAnalytics {
  salary_distribution: SalaryRange[];
  average_salary_by_level: Record<string, number>;
  total_jobs_with_salary: number;
}

export interface DailyJob {
  date: string;
  count: number;
}

export interface TrendsAnalytics {
  daily_jobs: DailyJob[];
  source_trends: Record<string, DailyJob[]>;
  period_days: number;
}

export interface LevelData {
  level: string;
  count: number;
}

export interface LevelsAnalytics {
  levels: LevelData[];
}

export interface JobTypeData {
  type: string;
  count: number;
}

export interface JobTypesAnalytics {
  job_types: JobTypeData[];
}

export interface Job {
  id: number;
  title: string;
  company_name: string | null;
  location: string | null;
  source: string | null;
  level: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean;
  required_skills: string[];
  created_at: string | null;
  source_url: string | null;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  skip: number;
  limit: number;
}

// Crawler Types

export interface CrawlSource {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface CrawlRequest {
  source: string;
  keywords?: string[];
  location?: string;
  pages?: number;
  headless?: boolean;
}

export interface CrawlJob {
  job_id: string;
  source: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  keywords?: string[];
  location?: string;
  pages: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  jobs_found: number;
  jobs_processed: number;
  error_message?: string;
}
