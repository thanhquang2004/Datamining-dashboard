import { useEffect, useState, useCallback } from "react";
import {
  Bot,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { crawlerApi } from "@/services/api";
import { CrawlJob, CrawlSource } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CrawlForm {
  source: string;
  keywords: string;
  location: string;
  pages: number;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: AlertCircle,
};

export default function Crawler() {
  const [sources, setSources] = useState<CrawlSource[]>([]);
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CrawlForm>({
    source: "itviec",
    keywords: "",
    location: "",
    pages: 2,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sourcesRes, jobsRes] = await Promise.all([
        crawlerApi.getSources(),
        crawlerApi.listJobs({ limit: 20 }),
      ]);
      setSources(sourcesRes.data.sources || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load crawler data. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll for job updates every 10 seconds
    const interval = setInterval(() => {
      crawlerApi
        .listJobs({ limit: 20 })
        .then((res) => {
          setJobs(res.data.jobs || []);
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const keywords = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      await crawlerApi.startCrawl({
        source: form.source,
        keywords: keywords.length > 0 ? keywords : undefined,
        location: form.location || undefined,
        pages: form.pages,
        headless: true,
      });

      setSuccess("Crawl job started successfully!");
      setForm({ ...form, keywords: "", location: "" });

      // Refresh jobs list
      setTimeout(fetchData, 1000);
    } catch (err: unknown) {
      console.error("Error starting crawl:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to start crawl: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Crawler</h1>
        <p className="text-gray-500">
          Start new crawl jobs and monitor their progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Crawl Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Start New Crawl
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Platform
                </label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {sources.find((s) => s.id === form.source)?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) =>
                    setForm({ ...form, keywords: e.target.value })
                  }
                  placeholder="python, react, data engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Ho Chi Minh, Vietnam"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pages to Crawl (1-10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.pages}
                  onChange={(e) =>
                    setForm({ ...form, pages: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Crawl
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Source Cards */}
          <div className="mt-6 space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
              >
                <h3 className="font-semibold text-gray-800">{source.name}</h3>
                <p className="text-sm text-gray-500">{source.description}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  {source.url}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Crawl Jobs
              </h2>
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No crawl jobs yet. Start a new crawl to see it here.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {jobs.map((job) => {
                  const StatusIcon = statusIcons[job.status];
                  return (
                    <div key={job.job_id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                                statusColors[job.status]
                              }`}
                            >
                              <StatusIcon
                                className={`w-3 h-3 ${
                                  job.status === "running" ? "animate-spin" : ""
                                }`}
                              />
                              {job.status}
                            </span>
                            <span className="text-sm font-medium text-gray-800 capitalize">
                              {job.source}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {job.keywords && job.keywords.length > 0 && (
                              <p>
                                <span className="text-gray-500">Keywords:</span>{" "}
                                {job.keywords.join(", ")}
                              </p>
                            )}
                            {job.location && (
                              <p>
                                <span className="text-gray-500">Location:</span>{" "}
                                {job.location}
                              </p>
                            )}
                            <p>
                              <span className="text-gray-500">Pages:</span>{" "}
                              {job.pages}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-800 font-semibold">
                            {job.jobs_found} jobs found
                          </p>
                          <p className="text-gray-500">
                            {job.jobs_processed} processed
                          </p>
                          {job.duration && (
                            <p className="text-gray-400 text-xs">
                              Duration: {formatDuration(job.duration)}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs">
                            {new Date(job.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {job.error_message && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                          {job.error_message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
