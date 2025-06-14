'use client'
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
  Alert
} from "@mui/material";
import { Stack } from "@mui/system";
import { Button } from '@mui/material';

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

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate skip value: (page - 1) * perPage
      const skip = (page - 1) * perPage;
      
      const response = await fetch(
        `https://smart-news-backend-production.up.railway.app/articles?skip=${skip}&limit=${perPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        }
      );
      
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
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage, perPage]); // Added perPage to dependencies

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
            key={article._id || `article-${index}`}
            size={{
              xs: 12,
              md: 6,
              lg: 4
            }}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '500px'
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
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Box>
              ) : (
				<Box sx={{ 
					height: '200px', 
					backgroundColor: (theme) => theme.palette.grey[100],
					borderRadius: '8px 8px 0 0' 
				  }} />
              )}
              
              {/* Article Content */}
              <CardContent sx={{ 
                p: 3, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '250px'
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
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '4rem'
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
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                      minHeight: '6rem'
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Pagination Controls */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={4}>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            backgroundColor: currentPage === 1 ? '#f5f5f5' : '#1976d2',
            color: currentPage === 1 ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        

		{/* Optional: Add page numbers for easier navigation */}
		{totalPages <= 10 && (
		  <Box display="flex" gap={1}>
			{Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
			  <Button
				key={pageNum}
				onClick={() => handlePageClick(pageNum)}
				variant={pageNum === currentPage ? "contained" : "outlined"}
				color="primary"
				size="small"
				sx={{
				  minWidth: '32px',
				  height: '32px',
				  fontSize: '12px',
				  ...(pageNum === currentPage && {
					backgroundColor: (theme) => theme.palette.primary.main,
					color: 'white',
					'&:hover': {
					  backgroundColor: (theme) => theme.palette.primary.dark,
					}
				  }),
				  ...(pageNum !== currentPage && {
					backgroundColor: (theme) => theme.palette.grey[100],
					color: (theme) => theme.palette.text.primary,
					borderColor: (theme) => theme.palette.grey[300],
					'&:hover': {
					  backgroundColor: (theme) => theme.palette.grey[200],
					}
				  })
				}}
			  >
				{pageNum}
			  </Button>
			))}
		  </Box>
		)}

		<Typography variant="body2" color="text.secondary">
		  Page {currentPage} of {totalPages} ({totalCount} total articles)
		</Typography>

		<Button
		  onClick={handleNextPage}
		  disabled={currentPage >= totalPages}
		  variant="contained"
		  color="primary"
		  sx={{
			...(currentPage >= totalPages && {
			  backgroundColor: (theme) => theme.palette.grey[300],
			  color: (theme) => theme.palette.grey[500],
			  cursor: 'not-allowed',
			  '&:hover': {
				backgroundColor: (theme) => theme.palette.grey[300],
			  }
			})
		  }}
		>
  Next
</Button>
      </Box>
    </Box>
  );
};

export default Blog;
