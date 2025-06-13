'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import { Stack } from "@mui/system";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

// Types based on your backend structure
interface SourceDocument {
  id?: string;
  name?: string;
}

interface ArticleDocument {
  _id?: string;
  source: SourceDocument;
  author?: string;
  title?: string;
  description?: string;
  url?: string;
  url_to_image?: string;
  published_at?: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

interface ArticlesResponse {
  articles: ArticleDocument[];
  count: number;
}

const Blog = () => {
  const [articles, setArticles] = useState<ArticleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(12); // Show 12 articles per page
  const [totalCount, setTotalCount] = useState(0);

  const fetchArticles = async (skipCount: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://smart-news-backend-production.up.railway.app/articles?skip=${skipCount}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors', // Explicitly set CORS mode
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ArticlesResponse = await response.json();
      setArticles(data.articles);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(skip);
  }, [skip]);

  const handleLoadMore = () => {
    const newSkip = skip + limit;
    if (newSkip < totalCount) {
      setSkip(newSkip);
    }
  };

  const handleLoadPrevious = () => {
    const newSkip = Math.max(0, skip - limit);
    setSkip(newSkip);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Latest News
      </Typography>
      
      <Grid container spacing={3}>
        {articles.map((article, index) => (
          <Grid
            key={article._id || index}
            size={{
              xs: 12,
              md: 6,
              lg: 4
            }}>
            <BlankCard sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '500px' // Ensure consistent card heights
            }}>
              {/* Article Image */}
              {article.url_to_image ? (
                <Box sx={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <Avatar
                    src={article.url_to_image}
                    variant="square"
                    sx={{
                      height: '100%',
                      width: '100%',
                      borderRadius: '8px 8px 0 0',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // Hide broken images
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Box>
              ) : (
                // Placeholder for articles without images to maintain consistent layout
                <Box sx={{ height: '200px', backgroundColor: '#f5f5f5', borderRadius: '8px 8px 0 0' }} />
              )}
              
              {/* Article Content */}
              <CardContent sx={{ 
                p: 3, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '250px' // Consistent content area height
              }}>
                <Box>
                  {/* Title */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      '-webkit-line-clamp': 3, // Allow up to 3 lines for title
                      '-webkit-box-orient': 'vertical',
                      overflow: 'hidden',
                      minHeight: '4rem' // Reserve space for 3 lines
                    }}
                  >
                    {article.title || 'No title available'}
                  </Typography>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      '-webkit-line-clamp': 4, // Allow up to 4 lines for description
                      '-webkit-box-orient': 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                      minHeight: '6rem' // Reserve space for 4 lines
                    }}
                  >
                    {article.description || 'No description available'}
                  </Typography>
                </Box>
                
                {/* Article Meta */}
                <Stack direction="column" spacing={1}>
                  {article.source?.name && (
                    <Typography variant="caption" color="primary">
                      {article.source.name}
                    </Typography>
                  )}
                  
                  {article.published_at && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(article.published_at).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  {article.url && (
                    <Typography 
                      component={Link} 
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      color="primary"
                      sx={{ 
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Read full article →
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </BlankCard>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={4}>
        <button
          onClick={handleLoadPrevious}
          disabled={skip === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: skip === 0 ? '#f5f5f5' : '#1976d2',
            color: skip === 0 ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: skip === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        
        <Typography variant="body2" color="text.secondary">
          Showing {skip + 1} - {Math.min(skip + limit, totalCount)} of {totalCount}
        </Typography>
        
        <button
          onClick={handleLoadMore}
          disabled={skip + limit >= totalCount}
          style={{
            padding: '8px 16px',
            backgroundColor: skip + limit >= totalCount ? '#f5f5f5' : '#1976d2',
            color: skip + limit >= totalCount ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: skip + limit >= totalCount ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </Box>
    </Box>
  );
};

export default Blog;
