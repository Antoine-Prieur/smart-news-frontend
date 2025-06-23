"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
  sentiment_analysis?: SentimentAnalysisResponse;
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
  const getSentimentDisplayProps = (sentiment: string, confidence?: number) => {
    const normalizedSentiment = sentiment.toLowerCase();

    switch (normalizedSentiment) {
      case "positive":
        return {
          color: "success" as const,
          label: `😊 Positive${confidence ? ` (${Math.round(confidence * 100)}%)` : ""}`,
        };
      case "negative":
        return {
          color: "error" as const,
          label: `😞 Negative${confidence ? ` (${Math.round(confidence * 100)}%)` : ""}`,
        };
      case "neutral":
        return {
          color: "default" as const,
          label: `😐 Neutral${confidence ? ` (${Math.round(confidence * 100)}%)` : ""}`,
        };
      default:
        return {
          color: "default" as const,
          label: "Unknown",
        };
    }
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
      // Use the page parameter instead of data.page to ensure consistency
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

  // Add this function to handle direct page navigation (optional)
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
          const sentimentProps = article.sentiment_analysis
            ? getSentimentDisplayProps(
                article.sentiment_analysis.prediction_value,
                article.sentiment_analysis.prediction_confidence,
              )
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
                    {/* Sentiment Badge - moved to top of card content */}
                    {sentimentProps && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={sentimentProps.label}
                          color={sentimentProps.color}
                          size="small"
                          sx={{
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "4rem",
                      }}
                    >
                      {article.title || "No title available"}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.5,
                        minHeight: "6rem",
                      }}
                    >
                      {article.description || "No description available"}
                    </Typography>
                  </Box>

                  {/* Article Meta */}
                  <Stack direction="column" spacing={1}>
                    {article.source?.name && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {article.source.name}
                      </Typography>
                    )}

                    {article.published_at && (
                      <Typography variant="caption" color="text.secondary">
                        {parseDate(article.published_at)?.toLocaleDateString()}
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
