"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import { Stack } from "@mui/system";
import { Button } from "@mui/material";
import NewsFilters from "./NewsFilter";

import { buildApiUrl, ENDPOINTS } from "@/config/api";

// Types based on your backend structure
interface SourceDocument {
  id?: string;
  name?: string;
}

interface SentimentAnalysisResponse {
  prediction_confidence?: number;
  prediction_value: string;
}

interface NewsClassificationResponse {
  prediction_confidence?: number;
  prediction_value: {
    labels: string[];
    scores: number[];
  };
}

interface PredictionsResponse {
  sentiment_analysis?: SentimentAnalysisResponse;
  news_classification?: NewsClassificationResponse;
}

interface ArticleDocument {
  _id?: string;
  source: SourceDocument;
  author?: string;
  title?: string;
  description?: string;
  url?: string;
  url_to_image?: string;
  published_at?: string | { $date: { $numberLong: string } };
  content?: string;
  created_at: string;
  updated_at: string;
  sentiment_analysis?: SentimentAnalysisResponse; // Legacy support
  predictions?: PredictionsResponse; // New structure
}

// Updated interface to match your new backend structure
interface PaginatedArticlesResponse {
  articles: ArticleDocument[];
  total_count: number;
  current_page_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const Blog = () => {
  const theme = useTheme();
  const [articles, setArticles] = useState<ArticleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "All News",
  ]);
  const [selectedSortBy, setSelectedSortBy] = useState<string>("latest");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");

  const parseDate = (
    dateField: string | { $date: { $numberLong: string } } | undefined,
  ) => {
    if (!dateField) return null;

    if (typeof dateField === "string") {
      return new Date(dateField);
    }

    if (typeof dateField === "object" && dateField.$date) {
      const timestamp = parseInt(dateField.$date.$numberLong, 10);
      return new Date(timestamp);
    }

    return null;
  };

  // Helper function to get sentiment color and icon
  const getSentimentDisplayProps = (sentiment: string) => {
    const normalizedSentiment = sentiment.toLowerCase();

    switch (normalizedSentiment) {
      case "positive":
        return {
          color: "success" as const,
          label: `😊 Positive`,
          sx: {
            backgroundColor: theme.palette.success.dark,
            color: "white",
            fontWeight: 600,
          },
        };
      case "negative":
        return {
          color: "error" as const,
          label: `😞 Negative`,
          sx: {
            fontWeight: 600,
          },
        };
      case "neutral":
        return {
          color: "default" as const,
          label: `😐 Neutral`,
          sx: {
            fontWeight: 600,
          },
        };
      default:
        return {
          color: "default" as const,
          label: "Unknown",
          sx: {
            fontWeight: 600,
          },
        };
    }
  };

  // Helper function to get news category display props
  const getCategoryDisplayProps = (category: string) => {
    const categoryMap: Record<string, { emoji: string; color: string }> = {
      "breaking news": { emoji: "🚨", color: theme.palette.error.main },
      politics: { emoji: "🏛️", color: theme.palette.info.main },
      economy: { emoji: "📈", color: theme.palette.success.main },
      business: { emoji: "💼", color: theme.palette.primary.main },
      technology: { emoji: "💻", color: theme.palette.secondary.main },
      health: { emoji: "🏥", color: theme.palette.error.light },
      science: { emoji: "🔬", color: theme.palette.info.light },
      sports: { emoji: "⚽", color: theme.palette.warning.main },
      entertainment: { emoji: "🎬", color: theme.palette.secondary.light },
      "world news": { emoji: "🌍", color: theme.palette.info.dark },
      "local news": { emoji: "🏘️", color: theme.palette.grey[600] },
      opinion: { emoji: "💭", color: theme.palette.warning.dark },
      lifestyle: { emoji: "🌟", color: theme.palette.secondary.main },
      environment: { emoji: "🌱", color: theme.palette.success.dark },
      military: { emoji: "⚔️", color: theme.palette.grey[700] },
      crime: { emoji: "🚔", color: theme.palette.error.dark },
      weather: { emoji: "🌤️", color: theme.palette.info.light },
      education: { emoji: "📚", color: theme.palette.primary.light },
    };

    const categoryInfo = categoryMap[category.toLowerCase()] || {
      emoji: "📰",
      color: theme.palette.grey[500],
    };

    return {
      label: `${categoryInfo.emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      color: categoryInfo.color,
    };
  };

  // Helper function to get top news categories with >70% confidence
  const getTopNewsCategories = (
    newsClassification?: NewsClassificationResponse,
  ) => {
    if (
      !newsClassification?.prediction_value?.labels ||
      !newsClassification?.prediction_value?.scores
    ) {
      return [];
    }

    const { labels, scores } = newsClassification.prediction_value;
    const categories = labels
      .map((label, index) => ({
        label,
        score: scores[index],
      }))
      .filter((category) => category.score >= 0.7) // Filter categories with >70% confidence
      .sort((a, b) => b.score - a.score) // Sort by confidence descending
      .slice(0, 3); // Take top 3 categories

    return categories;
  };

  // Helper function to get sentiment analysis from either legacy or new structure
  const getSentimentAnalysis = (
    article: ArticleDocument,
  ): SentimentAnalysisResponse | undefined => {
    // Check new predictions structure first
    if (article.predictions?.sentiment_analysis) {
      return article.predictions.sentiment_analysis;
    }
    // Fall back to legacy structure
    return article.sentiment_analysis;
  };

  // Helper function to get news classification from new structure
  const getNewsClassification = (
    article: ArticleDocument,
  ): NewsClassificationResponse | undefined => {
    return article.predictions?.news_classification;
  };

  const fetchArticles = async (page: number = 1, sentiment?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate skip value: (page - 1) * perPage
      const skip = (page - 1) * perPage;

      // Build query parameters
      const params: Record<string, string> = {
        skip: skip.toString(),
        limit: perPage.toString(),
      };

      // Add sentiment filter if not "all"
      if (sentiment && sentiment !== "all") {
        params.sentiment = sentiment;
      }

      const response = await fetch(buildApiUrl(ENDPOINTS.ARTICLES, params), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaginatedArticlesResponse = await response.json();
      setArticles(data.articles);
      setTotalCount(data.total_count);
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch articles");
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, selectedSentiment);
  }, [currentPage, perPage, selectedSentiment]);

  // Handle sentiment filter change
  const handleSentimentChange = (sentiment: string) => {
    setSelectedSentiment(sentiment);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading articles: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <NewsFilters
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        selectedSortBy={selectedSortBy}
        onSortChange={setSelectedSortBy}
        selectedSentiment={selectedSentiment}
        onSentimentChange={handleSentimentChange}
      />

      <Grid container spacing={3}>
        {articles.map((article, index) => {
          const sentimentAnalysis = getSentimentAnalysis(article);
          const newsClassification = getNewsClassification(article);
          const topCategories = getTopNewsCategories(newsClassification);

          const sentimentProps = sentimentAnalysis
            ? getSentimentDisplayProps(sentimentAnalysis.prediction_value)
            : null;

          return (
            <Grid
              key={article._id || `article-${index}`}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "500px",
                }}
              >
                {/* Article Image */}
                {article.url_to_image ? (
                  <Box
                    sx={{
                      height: "200px",
                      overflow: "hidden",
                    }}
                  >
                    <Avatar
                      src={article.url_to_image}
                      variant="square"
                      sx={{
                        height: "100%",
                        width: "100%",
                        borderRadius: "8px 8px 0 0",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: "200px",
                      backgroundColor: (theme) => theme.palette.grey[100],
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                )}

                {/* Article Content */}
                <CardContent
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "250px",
                  }}
                >
                  <Box>
                    {/* Classification and Sentiment Badges */}
                    <Box sx={{ mb: 2 }}>
                      {/* Sentiment Badge */}
                      {sentimentProps && (
                        <Box>
                          <Tooltip
                            title={
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, mb: 1 }}
                                >
                                  Sentiment:{" "}
                                  {sentimentAnalysis?.prediction_value}
                                </Typography>
                                {sentimentAnalysis?.prediction_confidence && (
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    Confidence:{" "}
                                    {(
                                      sentimentAnalysis.prediction_confidence *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </Typography>
                                )}
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  • <strong>Positive:</strong> Articles with
                                  optimistic, encouraging, or favorable content
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  • <strong>Negative:</strong> Articles with
                                  pessimistic, concerning, or unfavorable
                                  content
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  • <strong>Neutral:</strong> Articles with
                                  balanced, factual, or objective content
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, fontStyle: "italic" }}
                                >
                                  This classification uses AI algorithms to
                                  predict sentiment based on words in the title
                                  and description. As this is a prediction, it
                                  may contain errors.
                                </Typography>
                              </Box>
                            }
                            arrow
                            placement="top"
                            slotProps={{
                              tooltip: {
                                sx: {
                                  backgroundColor: "primary.main",
                                  color: "white",
                                  fontSize: "0.875rem",
                                  maxWidth: 300,
                                  "& .MuiTooltip-arrow": {
                                    color: "primary.main",
                                  },
                                },
                              },
                            }}
                          >
                            <Chip
                              label={sentimentProps.label}
                              color={sentimentProps.color}
                              size="small"
                              sx={{
                                ...sentimentProps.sx,
                                cursor: "help",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                                },
                              }}
                            />
                          </Tooltip>
                        </Box>
                      )}
                    </Box>

                    {/* News Categories */}
                    {topCategories.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}
                      >
                        {topCategories.map((category, categoryIndex) => {
                          const categoryProps = getCategoryDisplayProps(
                            category.label,
                          );
                          return (
                            <Tooltip
                              key={categoryIndex}
                              title={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, mb: 1 }}
                                  >
                                    News Category: {category.label}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    Confidence:{" "}
                                    {(category.score * 100).toFixed(1)}%
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontStyle: "italic" }}
                                  >
                                    AI-predicted news category based on article
                                    content. Only categories with ≥70%
                                    confidence are shown.
                                  </Typography>
                                </Box>
                              }
                              arrow
                              placement="top"
                              slotProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    fontSize: "0.875rem",
                                    maxWidth: 300,
                                    "& .MuiTooltip-arrow": {
                                      color: "primary.main",
                                    },
                                  },
                                },
                              }}
                            >
                              <Chip
                                label={categoryProps.label}
                                size="small"
                                sx={{
                                  backgroundColor: categoryProps.color,
                                  color: "white",
                                  fontWeight: 500,
                                  cursor: "help",
                                  transition: "all 0.2s ease-in-out",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                                  },
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Stack>
                    )}

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.title}
                    </Typography>

                    {/* Source and Author */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {article.source.name}
                        {article.author && ` • ${article.author}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {article.published_at &&
                          parseDate(article.published_at)?.toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 2,
                      }}
                    >
                      {article.description || "No description available"}
                    </Typography>
                  </Box>

                  <Stack spacing={1}>
                    {/* Content Preview */}
                    {article.content && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontStyle: "italic",
                        }}
                      >
                        {article.content.replace(/\[.*?\]/g, "")}
                      </Typography>
                    )}

                    {article.url && (
                      <Link
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            mt: 1,
                            width: "100%",
                            fontWeight: 500,
                          }}
                        >
                          Read Full Article
                        </Button>
                      </Link>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 4,
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {totalPages} ({totalCount} total articles)
        </Typography>

        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Blog;
