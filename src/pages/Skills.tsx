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
  Treemap,
} from "recharts";
import { dashboardApi } from "@/services/api";
import { SkillsAnalytics } from "@/types";
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
  "#6366F1",
  "#14B8A6",
  "#F97316",
  "#A855F7",
  "#22C55E",
  "#0EA5E9",
  "#E11D48",
];

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  index: number;
}

const CustomizedContent = ({
  x,
  y,
  width,
  height,
  name,
  index,
}: TreemapContentProps) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: "#fff",
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 50 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
    </g>
  );
};

export default function Skills() {
  const [skills, setSkills] = useState<SkillsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await dashboardApi.getSkills(30, source || undefined);
        setSkills(response.data);
      } catch (err) {
        console.error("Error fetching skills:", err);
        setError("Failed to load skills data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [source]);

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
        </div>
      </div>
    );
  }

  const treemapData =
    skills?.top_all_skills.slice(0, 20).map((s) => ({
      name: s.skill,
      size: s.count,
    })) || [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Skills Analytics</h1>
          <p className="text-gray-500">
            Analyze the most in-demand skills in job postings
          </p>
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sources</option>
          <option value="itviec">ITViec</option>
          <option value="topdev">TopDev</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Unique Skills</p>
          <p className="text-3xl font-bold text-blue-600">
            {skills?.total_unique_skills.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Top Required Skill</p>
          <p className="text-3xl font-bold text-green-600">
            {skills?.top_required_skills[0]?.skill || "N/A"}
          </p>
          <p className="text-sm text-gray-400">
            {skills?.top_required_skills[0]?.count.toLocaleString()} jobs
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Top Preferred Skill</p>
          <p className="text-3xl font-bold text-purple-600">
            {skills?.top_preferred_skills[0]?.skill || "N/A"}
          </p>
          <p className="text-sm text-gray-400">
            {skills?.top_preferred_skills[0]?.count.toLocaleString()} jobs
          </p>
        </div>
      </div>

      {/* Skills Treemap */}
      <ChartContainer
        title="Skills Distribution"
        subtitle="Skill demand represented by area size"
        className="mb-8"
      >
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={
              <CustomizedContent
                x={0}
                y={0}
                width={0}
                height={0}
                name=""
                index={0}
              />
            }
          />
        </ResponsiveContainer>
      </ChartContainer>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Required Skills */}
        <ChartContainer
          title="Top Required Skills"
          subtitle="Skills marked as required in job postings"
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={skills?.top_required_skills.slice(0, 15) || []}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="skill"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Preferred Skills */}
        <ChartContainer
          title="Top Preferred Skills"
          subtitle="Nice-to-have skills mentioned in job postings"
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={skills?.top_preferred_skills.slice(0, 15) || []}
              layout="vertical"
              margin={{ left: 80, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="skill"
                width={80}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* All Skills Pie Chart */}
      <ChartContainer
        title="Top 10 Skills Overall"
        subtitle="Combined required and preferred skills"
      >
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={
                skills?.top_all_skills
                  .slice(0, 10)
                  .map((s) => ({ name: s.skill, value: s.count })) || []
              }
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {skills?.top_all_skills.slice(0, 10).map((_, index) => (
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
    </div>
  );
}
