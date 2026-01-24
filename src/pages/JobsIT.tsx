import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Database,
  Briefcase,
  MapPin,
  TrendingUp,
  Code2,
  Search,
} from "lucide-react";
import { jobsITApi } from "@/services/api";
import {
  JobITStats,
  JobITSkillsAnalytics,
  JobITLocationsAnalytics,
  JobITCompaniesAnalytics,
  JobITPredictionsAnalytics,
  JobITExperienceAnalytics,
  JobsITResponse,
} from "@/types";
import StatCard from "@/components/StatCard";
import ChartContainer from "@/components/ChartContainer";
import LoadingSpinner from "@/components/LoadingSpinner";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

export default function JobsIT() {
  const [stats, setStats] = useState<JobITStats | null>(null);
  const [skills, setSkills] = useState<JobITSkillsAnalytics | null>(null);
  const [locations, setLocations] = useState<JobITLocationsAnalytics | null>(
    null,
  );
  const [companies, setCompanies] = useState<JobITCompaniesAnalytics | null>(
    null,
  );
  const [predictions, setPredictions] =
    useState<JobITPredictionsAnalytics | null>(null);
  const [experience, setExperience] = useState<JobITExperienceAnalytics | null>(
    null,
  );
  const [jobs, setJobs] = useState<JobsITResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedPred, setSelectedPred] = useState<string>("");

  const itemsPerPage = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          statsRes,
          skillsRes,
          locationsRes,
          companiesRes,
          predictionsRes,
          experienceRes,
          jobsRes,
        ] = await Promise.all([
          jobsITApi.getStats(),
          jobsITApi.getSkills(15),
          jobsITApi.getLocations(10),
          jobsITApi.getCompanies(10),
          jobsITApi.getPredictions(),
          jobsITApi.getExperience(),
          jobsITApi.getJobs({ skip: 0, limit: itemsPerPage }),
        ]);

        setStats(statsRes.data);
        setSkills(skillsRes.data);
        setLocations(locationsRes.data);
        setCompanies(companiesRes.data);
        setPredictions(predictionsRes.data);
        setExperience(experienceRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error("Error fetching JobsIT data:", err);
        setError(
          "Failed to load preprocessed IT jobs data. Please make sure the API is running.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const params: any = {
          skip: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
        };

        if (searchTerm) params.search = searchTerm;
        if (selectedSource) params.source = selectedSource;
        if (selectedLevel) params.level = selectedLevel;
        if (selectedPred) params.pred = parseInt(selectedPred);

        const jobsRes = await jobsITApi.getJobs(params);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    }

    fetchJobs();
  }, [currentPage, searchTerm, selectedSource, selectedLevel, selectedPred]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sourceData = stats
    ? Object.entries(stats.jobs_by_source).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const levelData = stats
    ? Object.entries(stats.jobs_by_level).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const predictionData = predictions
    ? predictions.predictions.map((p) => ({
        name: `Class ${p.prediction}`,
        value: p.count,
      }))
    : [];

  const remoteVsOnsite = stats
    ? [
        { name: "Remote", value: stats.remote_jobs },
        { name: "On-site", value: stats.onsite_jobs },
      ]
    : [];

  const totalPages = jobs ? Math.ceil(jobs.total / itemsPerPage) : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Preprocessed IT Jobs
        </h1>
        <p className="text-gray-500 mt-2">
          Analytics and insights from preprocessed IT job data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total IT Jobs"
          value={stats?.total_jobs.toLocaleString() || 0}
          subtitle={`${stats?.active_jobs.toLocaleString() || 0} active`}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Data Sources"
          value={sourceData.length.toString()}
          subtitle={`${stats?.remote_jobs || 0} remote jobs`}
          icon={<Database className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Avg Experience"
          value={
            stats?.avg_experience_min
              ? `${stats.avg_experience_min.toFixed(1)} - ${stats.avg_experience_max?.toFixed(1) || 0} years`
              : "N/A"
          }
          subtitle="Required experience"
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Unique Skills"
          value={skills?.total_skills.toLocaleString() || 0}
          subtitle={`From ${skills?.total_jobs_analyzed || 0} jobs`}
          icon={<Code2 className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Jobs by Source">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Jobs by Level">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Top Skills">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skills?.top_skills || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="skill" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Experience Requirements">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={experience?.experience_ranges || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Prediction Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={predictionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {predictionData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Remote vs On-site">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={remoteVsOnsite}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {remoteVsOnsite.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Top Locations and Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer title="Top Locations">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locations?.top_locations || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="location"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Top Companies">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={companies?.top_companies || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="company_name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">IT Jobs List</h2>
          <span className="text-sm text-gray-500">
            {jobs?.total.toLocaleString() || 0} total jobs
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            {sourceData.map((source) => (
              <option key={source.name} value={source.name}>
                {source.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            {levelData.map((level) => (
              <option key={level.name} value={level.name}>
                {level.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPred}
            onChange={(e) => {
              setSelectedPred(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Predictions</option>
            {predictionData.map((pred) => (
              <option key={pred.name} value={pred.name.replace("Class ", "")}>
                {pred.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Experience
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Prediction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs?.jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {job.title}
                      </div>
                      {job.required_skills &&
                        job.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.required_skills
                              .slice(0, 3)
                              .map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            {job.required_skills.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{job.required_skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {job.company_name || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.location || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                      {job.level || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {job.experience_years_min || job.experience_years_max
                      ? `${job.experience_years_min || 0} - ${job.experience_years_max || 0} years`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        job.pred === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Class {job.pred ?? "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {job.source || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, jobs?.total || 0)} of{" "}
            {jobs?.total.toLocaleString() || 0} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
