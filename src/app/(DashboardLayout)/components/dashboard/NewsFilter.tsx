import React, { useState } from "react";
import {
  Box,
  Chip,
  Typography,
  Stack,
  Paper,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  IconFilter,
  IconChevronDown,
  IconChevronUp,
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
} from "@tabler/icons-react";

interface NewsFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedSortBy: string;
  onSortChange: (sortBy: string) => void;
  selectedSentiment: string;
  onSentimentChange: (sentiment: string) => void;
}

const sentimentOptions = [
  {
    value: "all",
    label: "All Sentiments",
    icon: null,
    color: "default" as const,
  },
  {
    value: "positive",
    label: "Positive",
    icon: IconMoodSmile,
    color: "success" as const,
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: IconMoodNeutral,
    color: "default" as const,
  },
  {
    value: "negative",
    label: "Negative",
    icon: IconMoodSad,
    color: "error" as const,
  },
];

const NewsFilters: React.FC<NewsFiltersProps> = ({
  selectedSentiment,
  onSentimentChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSentimentClick = (sentimentValue: string) => {
    onSentimentChange(sentimentValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ cursor: "pointer" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconFilter size={20} color="currentColor" />
          <Typography variant="h6" color="text.primary">
            Filters
          </Typography>
        </Stack>

        <IconButton size="small">
          {isExpanded ? (
            <IconChevronUp size={18} />
          ) : (
            <IconChevronDown size={18} />
          )}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2 }}>
          {/* Sentiment Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Sentiment
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {sentimentOptions.map((sentiment) => {
                const IconComponent = sentiment.icon;
                return (
                  <Chip
                    key={sentiment.value}
                    label={sentiment.label}
                    onClick={() => handleSentimentClick(sentiment.value)}
                    variant={
                      selectedSentiment === sentiment.value
                        ? "filled"
                        : "outlined"
                    }
                    color={
                      selectedSentiment === sentiment.value
                        ? sentiment.color
                        : "default"
                    }
                    size="small"
                    icon={
                      IconComponent ? <IconComponent size={16} /> : undefined
                    }
                    sx={{
                      mb: 1,
                      "&:hover": {
                        backgroundColor:
                          selectedSentiment === sentiment.value
                            ? `${sentiment.color}.dark`
                            : "action.hover",
                      },
                      ...(selectedSentiment === sentiment.value && {
                        backgroundColor: `${sentiment.color}.main`,
                        color: `${sentiment.color}.contrastText`,
                        "& .MuiChip-deleteIcon": {
                          color: `${sentiment.color}.contrastText`,
                        },
                      }),
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Box>
      </Collapse>

      {/* Always visible selected filters summary */}
      {!isExpanded && selectedSentiment !== "all" && (
        <Box mt={1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="caption" color="text.secondary">
              {
                sentimentOptions.find((opt) => opt.value === selectedSentiment)
                  ?.label
              }
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default NewsFilters;
