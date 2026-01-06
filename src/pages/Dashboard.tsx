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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Briefcase, Building2, DollarSign, Home } from "lucide-react";
import { dashboardApi } from "@/services/api";
import {
  DashboardStats,
  SkillsAnalytics,
  LocationsAnalytics,
  SalaryAnalytics,
  TrendsAnalytics,
  LevelsAnalytics,
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

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [skills, setSkills] = useState<SkillsAnalytics | null>(null);
  const [locations, setLocations] = useState<LocationsAnalytics | null>(null);
  const [salary, setSalary] = useState<SalaryAnalytics | null>(null);
  const [trends, setTrends] = useState<TrendsAnalytics | null>(null);
  const [levels, setLevels] = useState<LevelsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          statsRes,
          skillsRes,
          locationsRes,
          salaryRes,
          trendsRes,
          levelsRes,
        ] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getSkills(10),
          dashboardApi.getLocations(10),
          dashboardApi.getSalary(),
          dashboardApi.getTrends(30),
          dashboardApi.getLevels(),
        ]);

        setStats(statsRes.data);
        setSkills(skillsRes.data);
        setLocations(locationsRes.data);
        setSalary(salaryRes.data);
        setTrends(trendsRes.data);
        setLevels(levelsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Failed to load dashboard data. Please make sure the API is running."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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

  const remoteVsOnsite = stats
    ? [
        { name: "Remote", value: stats.remote_jobs },
        { name: "On-site", value: stats.onsite_jobs },
      ]
    : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">
          Job market analytics and insights from crawled data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats?.total_jobs.toLocaleString() || 0}
          subtitle={`${stats?.active_jobs.toLocaleString() || 0} active`}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Companies"
          value={sourceData.length > 0 ? sourceData.length + " sources" : "0"}
          subtitle="Data sources tracked"
          icon={<Building2 className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Remote Jobs"
          value={stats?.remote_jobs.toLocaleString() || 0}
          subtitle={`${Math.round(
            ((stats?.remote_jobs || 0) / (stats?.total_jobs || 1)) * 100
          )}% of total`}
          icon={<Home className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Avg Salary"
          value={
            stats?.average_salary
              ? `$${Math.round(stats.average_salary).toLocaleString()}`
              : "N/A"
          }
          subtitle={`${stats?.jobs_with_salary || 0} jobs with salary`}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Jobs by Source */}
        <ChartContainer
          title="Jobs by Source"
          subtitle="Distribution across platforms"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                outerRadius={100}
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

        {/* Remote vs On-site */}
        <ChartContainer
          title="Work Type Distribution"
          subtitle="Remote vs On-site positions"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={remoteVsOnsite}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10B981" />
                <Cell fill="#6366F1" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Skills */}
        <ChartContainer
          title="Top Required Skills"
          subtitle="Most in-demand skills"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={skills?.top_required_skills.slice(0, 10) || []}
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="skill" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Job Levels */}
        <ChartContainer
          title="Experience Levels"
          subtitle="Jobs by seniority level"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levels?.levels || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Locations */}
        <ChartContainer title="Top Locations" subtitle="Jobs by location">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={locations?.locations.slice(0, 10) || []}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="location" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Salary Distribution */}
        <ChartContainer
          title="Salary Distribution"
          subtitle="Jobs by salary range"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salary?.salary_distribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Job Trends */}
      <ChartContainer
        title="Job Posting Trends"
        subtitle="Daily job postings over the last 30 days"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends?.daily_jobs || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="Jobs Posted"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
