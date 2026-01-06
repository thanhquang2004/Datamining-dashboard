import { useEffect, useState, useCallback } from "react";
import { Search, ExternalLink, MapPin, Building2, Filter } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { Job, JobsResponse } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [level, setLevel] = useState("");
  // Location filter - setLocation available for future location input field
  const [location] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getJobs({
        skip: page * limit,
        limit,
        source: source || undefined,
        level: level || undefined,
        location: location || undefined,
        search: search || undefined,
      });
      const data: JobsResponse = response.data;
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, source, level, location, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchJobs();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Jobs</h1>
        <p className="text-gray-500">Browse all crawled job postings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-700">Filters</h3>
        </div>
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            <option value="itviec">ITViec</option>
            <option value="topdev">TopDev</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="Junior">Junior</option>
            <option value="Middle">Middle</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
            <option value="Manager">Manager</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {jobs.length} of {total.toLocaleString()} jobs
          </p>
        </div>

        {loading ? (
          <div className="p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No jobs found matching your criteria
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {job.title}
                        </h3>
                        {job.is_remote && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Remote
                          </span>
                        )}
                        {job.source && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                            {job.source}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {job.company_name && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company_name}</span>
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.level && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            {job.level}
                          </span>
                        )}
                        {job.salary_min && (
                          <span className="text-green-600 font-medium">
                            {job.salary_currency || "$"}
                            {job.salary_min.toLocaleString()}
                            {job.salary_max &&
                              ` - ${job.salary_max.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      {job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.slice(0, 6).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 6 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                              +{job.required_skills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {job.source_url && (
                      <a
                        href={job.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View original posting"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
