"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";

interface MarketSearchViewProps {
  spaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ComprehensiveAnalysis {
  metadata: {
    input_prompt: string;
    generated_at: string;
    sources_used: string[];
  };
  customer_feedback: {
    total_feedback_count: number;
    sentiment_breakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
    average_sentiment_score: number;
    themes: Array<{
      name: string;
      description: string;
      mention_count: number;
      example_ids: string[];
    }>;
    top_pain_points: Array<{
      summary: string;
      occurrence_count: number;
      severity: "High" | "Medium" | "Low";
      segments_most_affected: string[];
    }>;
    top_delighters: Array<{
      summary: string;
      why_users_love_this: string;
      mention_count: number;
    }>;
    sample_quotes: Array<{
      id: string;
      segment: string;
      quote: string;
      sentiment: "positive" | "neutral" | "negative";
    }>;
    segments_summary: Array<{
      segment: string;
      feedback_count: number;
      avg_sentiment_score: number;
      common_themes: string[];
    }>;
    source_urls: string[];
  };
  okr: Array<{
    id: string;
    title: string;
    primary_okrs: string[];
    alignment: "High" | "Medium" | "Low" | "None";
    rationale: string;
    alignment_score: number;
    okr_progress_percent: number;
  }>;
  industry_news: {
    article_count: number;
    time_window_days: number;
    top_topics: Array<{
      topic: string;
      mention_count: number;
      avg_sentiment_score: number;
      trend_change_percent: number;
    }>;
    sources_summary: Array<{
      source: string;
      article_count: number;
      avg_sentiment_score: number;
    }>;
    source_urls: string[];
  };
  competitor_insights: {
    competitor_count: number;
    average_market_share_percent: number;
    competitors: Array<{
      competitor_name: string;
      activity_summary: string;
      strategic_focus: string;
      impact_level: "High" | "Medium" | "Low";
      recent_launches_count: number;
      growth_rate_percent: number;
      share_of_mentions_percent: number;
      user_sentiment_score: number;
    }>;
    trend_summary: {
      rising_competitors: string[];
      declining_competitors: string[];
    };
    source_urls: string[];
  };
}

export default function MarketSearchView({
  spaceId,
  isOpen,
  onClose,
}: MarketSearchViewProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] =
    useState<ComprehensiveAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "feedback" | "okr" | "news" | "competitors"
  >("overview");
  const [okrFile, setOkrFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
      setOkrFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (!okrFile) {
      setError("Please upload an OKR document (PDF)");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("okrFile", okrFile);
      formData.append("spaceId", spaceId);

      const response = await fetch("/api/agents/marketSearch", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze");
      }

      setAnalysisData(result.data);
      setActiveTab("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return "#10B981"; // green
    if (sentiment < -0.3) return "#EF4444"; // red
    return "#F59E0B"; // amber
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "High":
        return "#10B981";
      case "Medium":
        return "#F59E0B";
      case "Low":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="ml-auto bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        style={{
          width: "90%",
          maxWidth: "1200px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"
              style={{ color: "var(--primary)" }}
            >
              <Icon icon="solar:graph-new-bold-duotone" width="24" height="24" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">
                Market Research & Analysis
              </h2>
              <p className="text-sm text-white opacity-90">
                Comprehensive market intelligence powered by AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Input Section */}
          <div className="mb-6 space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                What would you like to analyze?
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && okrFile && handleAnalyze()}
                placeholder="e.g., AI-powered customer support chatbot"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--text-primary)",
                }}
                disabled={loading}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Upload OKR Document (PDF)
              </label>
              <div className="flex items-center gap-3">
                <label
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: okrFile ? "var(--primary)" : "var(--border)",
                    backgroundColor: okrFile ? "var(--primary-bg)" : "#FFFFFF",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Icon
                    icon={okrFile ? "solar:document-text-bold-duotone" : "solar:upload-bold-duotone"}
                    width="20"
                    height="20"
                    style={{ color: okrFile ? "var(--primary)" : "var(--text-secondary)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: okrFile ? "var(--primary)" : "var(--text-secondary)" }}
                  >
                    {okrFile ? okrFile.name : "Click to upload PDF"}
                  </span>
                </label>
                {okrFile && (
                  <button
                    onClick={() => setOkrFile(null)}
                    className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
                Upload your organization's OKR document to analyze alignment
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !prompt.trim() || !okrFile}
              className="w-full px-6 py-3 font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading || !prompt.trim() || !okrFile ? "#9CA3AF" : "var(--primary)",
                cursor: loading || !prompt.trim() || !okrFile ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Icon
                    icon="solar:round-alt-arrow-right-bold-duotone"
                    width="20"
                    height="20"
                    className="animate-spin"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Icon
                    icon="solar:magnifer-zoom-in-bold"
                    width="20"
                    height="20"
                  />
                  Analyze Market & OKR Alignment
                </>
              )}
            </button>

            {error && (
              <p className="text-sm" style={{ color: "#EF4444" }}>
                {error}
              </p>
            )}
          </div>

          {/* Results */}
          {analysisData && (
            <>
              {/* Tabs */}
              <div className="border-b mb-6" style={{ borderColor: "var(--border)" }}>
                <div className="flex gap-1">
                  {[
                    { id: "overview", label: "Overview", icon: "solar:pie-chart-2-bold-duotone" },
                    {
                      id: "feedback",
                      label: "Customer Feedback",
                      icon: "solar:chat-round-like-bold-duotone",
                    },
                    { id: "okr", label: "OKR Alignment", icon: "solar:target-bold-duotone" },
                    { id: "news", label: "Industry News", icon: "solar:newspaper-bold-duotone" },
                    {
                      id: "competitors",
                      label: "Competitors",
                      icon: "solar:users-group-rounded-bold-duotone",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(
                          tab.id as
                            | "overview"
                            | "feedback"
                            | "okr"
                            | "news"
                            | "competitors"
                        )
                      }
                      className="px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2"
                      style={{
                        color:
                          activeTab === tab.id
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                        borderBottom:
                          activeTab === tab.id
                            ? "2px solid var(--primary)"
                            : "2px solid transparent",
                      }}
                    >
                      <Icon icon={tab.icon} width="18" height="18" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <h3
                        className="text-sm font-medium mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Analysis Query
                      </h3>
                      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {analysisData.metadata.input_prompt}
                      </p>
                      <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                        Generated: {new Date(analysisData.metadata.generated_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-5 rounded-lg border"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#DBEAFE" }}
                          >
                            <Icon
                              icon="solar:chat-round-like-bold-duotone"
                              width="20"
                              height="20"
                              style={{ color: "#2563EB" }}
                            />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Customer Feedback
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                              {analysisData.customer_feedback.total_feedback_count}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                          >
                            👍 {analysisData.customer_feedback.sentiment_breakdown.positive}
                          </span>
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                          >
                            😐 {analysisData.customer_feedback.sentiment_breakdown.neutral}
                          </span>
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                          >
                            👎 {analysisData.customer_feedback.sentiment_breakdown.negative}
                          </span>
                        </div>
                      </div>

                      <div
                        className="p-5 rounded-lg border"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#FCE7F3" }}
                          >
                            <Icon
                              icon="solar:users-group-rounded-bold-duotone"
                              width="20"
                              height="20"
                              style={{ color: "#BE185D" }}
                            />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Competitors Tracked
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                              {analysisData.competitor_insights.competitor_count}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Avg Market Share: {analysisData.competitor_insights.average_market_share_percent.toFixed(1)}%
                        </p>
                      </div>

                      <div
                        className="p-5 rounded-lg border"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#FEF3C7" }}
                          >
                            <Icon
                              icon="solar:newspaper-bold-duotone"
                              width="20"
                              height="20"
                              style={{ color: "#D97706" }}
                            />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Industry Articles
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                              {analysisData.industry_news.article_count}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Last {analysisData.industry_news.time_window_days} days
                        </p>
                      </div>

                      <div
                        className="p-5 rounded-lg border"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#D1FAE5" }}
                          >
                            <Icon
                              icon="solar:target-bold-duotone"
                              width="20"
                              height="20"
                              style={{ color: "#059669" }}
                            />
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              OKR Alignments
                            </p>
                            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                              {analysisData.okr.length}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {analysisData.okr.filter((o) => o.alignment === "High").length} High Priority
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "feedback" && (
                  <div className="space-y-6">
                    {/* Themes */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Key Themes
                      </h3>
                      <div className="space-y-3">
                        {analysisData.customer_feedback.themes.map((theme, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className="font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {theme.name}
                              </h4>
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: "var(--primary-bg)",
                                  color: "var(--primary)",
                                }}
                              >
                                {theme.mention_count} mentions
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {theme.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pain Points */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Top Pain Points
                      </h3>
                      <div className="space-y-3">
                        {analysisData.customer_feedback.top_pain_points.map((pain, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className="font-medium flex-1"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {pain.summary}
                              </h4>
                              <span
                                className="px-2 py-1 rounded text-xs font-medium ml-2"
                                style={{
                                  backgroundColor:
                                    pain.severity === "High"
                                      ? "#FEE2E2"
                                      : pain.severity === "Medium"
                                      ? "#FEF3C7"
                                      : "#D1FAE5",
                                  color:
                                    pain.severity === "High"
                                      ? "#991B1B"
                                      : pain.severity === "Medium"
                                      ? "#92400E"
                                      : "#065F46",
                                }}
                              >
                                {pain.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                              <span>{pain.occurrence_count} occurrences</span>
                              {pain.segments_most_affected.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Affects: {pain.segments_most_affected.join(", ")}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delighters */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        What Users Love
                      </h3>
                      <div className="space-y-3">
                        {analysisData.customer_feedback.top_delighters.map((delight, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: "#F0FDF4",
                              borderColor: "#BBF7D0",
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className="font-medium"
                                style={{ color: "#065F46" }}
                              >
                                {delight.summary}
                              </h4>
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: "#D1FAE5",
                                  color: "#065F46",
                                }}
                              >
                                {delight.mention_count} mentions
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: "#047857" }}>
                              {delight.why_users_love_this}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sample Quotes */}
                    {analysisData.customer_feedback.sample_quotes.length > 0 && (
                      <div>
                        <h3
                          className="text-lg font-semibold mb-4"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Sample Quotes
                        </h3>
                        <div className="space-y-3">
                          {analysisData.customer_feedback.sample_quotes.map((quote, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-lg border-l-4"
                              style={{
                                backgroundColor: "#FAFAFA",
                                borderLeftColor: getSentimentColor(
                                  quote.sentiment === "positive"
                                    ? 0.7
                                    : quote.sentiment === "negative"
                                    ? -0.7
                                    : 0
                                ),
                              }}
                            >
                              <p
                                className="text-sm italic mb-2"
                                style={{ color: "var(--text-primary)" }}
                              >
                                "{quote.quote}"
                              </p>
                              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                                <span>{quote.segment}</span>
                                <span>•</span>
                                <span className="capitalize">{quote.sentiment}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {analysisData.customer_feedback.source_urls.length > 0 && (
                      <div>
                        <h3
                          className="text-sm font-medium mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Sources
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.customer_feedback.source_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50 transition-colors"
                              style={{
                                color: "var(--primary)",
                                borderColor: "var(--border)",
                              }}
                            >
                              Source {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "okr" && (
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: "var(--text-primary)" }}
                    >
                      OKR Alignment Analysis
                    </h3>
                    {analysisData.okr.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-lg border"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4
                            className="font-semibold text-base"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.title}
                          </h4>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getAlignmentColor(item.alignment)}20`,
                              color: getAlignmentColor(item.alignment),
                            }}
                          >
                            {item.alignment} Alignment
                          </span>
                        </div>

                        {item.primary_okrs.length > 0 && (
                          <div className="mb-3">
                            <p
                              className="text-xs font-medium mb-2"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Related OKRs:
                            </p>
                            <div className="space-y-1">
                              {item.primary_okrs.map((okr, oidx) => (
                                <p
                                  key={oidx}
                                  className="text-sm"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  • {okr}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <p
                          className="text-sm mb-3"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.rationale}
                        </p>

                        <div className="flex gap-4 text-xs">
                          <div>
                            <span style={{ color: "var(--text-tertiary)" }}>
                              Alignment Score:
                            </span>
                            <span
                              className="ml-1 font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {(item.alignment_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-tertiary)" }}>
                              Progress:
                            </span>
                            <span
                              className="ml-1 font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {item.okr_progress_percent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "news" && (
                  <div className="space-y-6">
                    {/* Top Topics */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Trending Topics
                      </h3>
                      <div className="space-y-3">
                        {analysisData.industry_news.top_topics.map((topic, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4
                                className="font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {topic.topic}
                              </h4>
                              <div className="flex gap-2">
                                <span
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: "var(--primary-bg)",
                                    color: "var(--primary)",
                                  }}
                                >
                                  {topic.mention_count} mentions
                                </span>
                                {topic.trend_change_percent !== 0 && (
                                  <span
                                    className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    style={{
                                      backgroundColor:
                                        topic.trend_change_percent > 0 ? "#D1FAE5" : "#FEE2E2",
                                      color:
                                        topic.trend_change_percent > 0 ? "#065F46" : "#991B1B",
                                    }}
                                  >
                                    {topic.trend_change_percent > 0 ? "↑" : "↓"}{" "}
                                    {Math.abs(topic.trend_change_percent).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (topic.avg_sentiment_score + 1) * 50
                                    )}%`,
                                    backgroundColor: getSentimentColor(
                                      topic.avg_sentiment_score
                                    ),
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs whitespace-nowrap"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                Sentiment: {topic.avg_sentiment_score.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sources Summary */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Sources
                      </h3>
                      <div className="space-y-2">
                        {analysisData.industry_news.sources_summary.map((source, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border flex items-center justify-between"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div>
                              <p
                                className="font-medium text-sm"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {source.source}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                {source.article_count} articles
                              </p>
                            </div>
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: `${getSentimentColor(
                                  source.avg_sentiment_score
                                )}20`,
                                color: getSentimentColor(source.avg_sentiment_score),
                              }}
                            >
                              {source.avg_sentiment_score.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source URLs */}
                    {analysisData.industry_news.source_urls.length > 0 && (
                      <div>
                        <h3
                          className="text-sm font-medium mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Article Links
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.industry_news.source_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50 transition-colors"
                              style={{
                                color: "var(--primary)",
                                borderColor: "var(--border)",
                              }}
                            >
                              Article {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "competitors" && (
                  <div className="space-y-6">
                    {/* Trend Summary */}
                    {(analysisData.competitor_insights.trend_summary.rising_competitors.length >
                      0 ||
                      analysisData.competitor_insights.trend_summary.declining_competitors
                        .length > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        {analysisData.competitor_insights.trend_summary.rising_competitors.length >
                          0 && (
                          <div
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: "#F0FDF4",
                              borderColor: "#BBF7D0",
                            }}
                          >
                            <h4
                              className="text-sm font-medium mb-2 flex items-center gap-2"
                              style={{ color: "#065F46" }}
                            >
                              <Icon icon="solar:arrow-up-bold" width="16" height="16" />
                              Rising
                            </h4>
                            <div className="space-y-1">
                              {analysisData.competitor_insights.trend_summary.rising_competitors.map(
                                (comp, idx) => (
                                  <p key={idx} className="text-sm" style={{ color: "#047857" }}>
                                    • {comp}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {analysisData.competitor_insights.trend_summary.declining_competitors
                          .length > 0 && (
                          <div
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: "#FEF2F2",
                              borderColor: "#FECACA",
                            }}
                          >
                            <h4
                              className="text-sm font-medium mb-2 flex items-center gap-2"
                              style={{ color: "#991B1B" }}
                            >
                              <Icon icon="solar:arrow-down-bold" width="16" height="16" />
                              Declining
                            </h4>
                            <div className="space-y-1">
                              {analysisData.competitor_insights.trend_summary.declining_competitors.map(
                                (comp, idx) => (
                                  <p key={idx} className="text-sm" style={{ color: "#DC2626" }}>
                                    • {comp}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Competitors */}
                    <div>
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Competitor Analysis
                      </h3>
                      <div className="space-y-4">
                        {analysisData.competitor_insights.competitors.map((comp, idx) => (
                          <div
                            key={idx}
                            className="p-5 rounded-lg border"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "var(--border)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4
                                className="font-semibold text-base"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {comp.competitor_name}
                              </h4>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${getAlignmentColor(
                                    comp.impact_level
                                  )}20`,
                                  color: getAlignmentColor(comp.impact_level),
                                }}
                              >
                                {comp.impact_level} Impact
                              </span>
                            </div>

                            <p
                              className="text-sm mb-3"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {comp.activity_summary}
                            </p>

                            <div
                              className="p-3 rounded-lg mb-3"
                              style={{ backgroundColor: "var(--background)" }}
                            >
                              <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                Strategic Focus:
                              </p>
                              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                                {comp.strategic_focus}
                              </p>
                            </div>

                            <div className="grid grid-cols-4 gap-3 text-xs">
                              <div>
                                <p style={{ color: "var(--text-tertiary)" }}>Launches</p>
                                <p
                                  className="font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {comp.recent_launches_count}
                                </p>
                              </div>
                              <div>
                                <p style={{ color: "var(--text-tertiary)" }}>Growth</p>
                                <p
                                  className="font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {comp.growth_rate_percent.toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p style={{ color: "var(--text-tertiary)" }}>Share</p>
                                <p
                                  className="font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {comp.share_of_mentions_percent.toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p style={{ color: "var(--text-tertiary)" }}>Sentiment</p>
                                <p
                                  className="font-medium"
                                  style={{
                                    color: getSentimentColor(comp.user_sentiment_score),
                                  }}
                                >
                                  {comp.user_sentiment_score.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source URLs */}
                    {analysisData.competitor_insights.source_urls.length > 0 && (
                      <div>
                        <h3
                          className="text-sm font-medium mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Sources
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.competitor_insights.source_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50 transition-colors"
                              style={{
                                color: "var(--primary)",
                                borderColor: "var(--border)",
                              }}
                            >
                              Source {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !analysisData && !error && (
            <div className="text-center py-20">
              <Icon
                icon="solar:graph-new-bold-duotone"
                width="80"
                height="80"
                className="mx-auto mb-4"
                style={{ color: "var(--text-tertiary)" }}
              />
              <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Ready to analyze
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Enter a product or idea above to get comprehensive market intelligence
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

