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
} from "@tabler/icons-react";

interface NewsFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedSortBy: string;
  onSortChange: (sortBy: string) => void;
}

const categories = [
  "All News",
  "Politics",
  "Sports",
  "Technology",
  "Health",
  "Business",
  "Entertainment",
  "Science",
  "World",
];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
];

const NewsFilters: React.FC<NewsFiltersProps> = ({
  selectedCategories,
  onCategoryChange,
  selectedSortBy,
  onSortChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryClick = (category: string) => {
    if (category === "All News") {
      onCategoryChange(["All News"]);
      return;
    }

    let newCategories: string[];
    if (selectedCategories.includes(category)) {
      newCategories = selectedCategories.filter((cat) => cat !== category);
      if (newCategories.length === 0) {
        newCategories = ["All News"];
      }
    } else {
      newCategories = selectedCategories.filter((cat) => cat !== "All News");
      newCategories.push(category);
    }

    onCategoryChange(newCategories);
  };

  const handleSortClick = (sortValue: string) => {
    onSortChange(sortValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: "background.default", // Your theme's pastel background
        border: "1px solid",
        borderColor: "divider", // Light desert sand from your theme
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
            <IconChevronUp size={20} />
          ) : (
            <IconChevronDown size={20} />
          )}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box mt={2}>
          {/* Categories */}
          <Box mb={3}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              mb={1.5}
              sx={{ fontWeight: 600 }}
            >
              Categories
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handleCategoryClick(category)}
                  variant={
                    selectedCategories.includes(category)
                      ? "filled"
                      : "outlined"
                  }
                  color={
                    selectedCategories.includes(category)
                      ? "primary"
                      : "default"
                  }
                  size="small"
                  sx={{
                    mb: 1,
                    "&:hover": {
                      backgroundColor: selectedCategories.includes(category)
                        ? "primary.dark"
                        : "action.hover", // Uses your theme's action hover color
                    },
                    ...(selectedCategories.includes(category) && {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "& .MuiChip-deleteIcon": {
                        color: "primary.contrastText",
                      },
                    }),
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Sort Options */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              mb={1.5}
              sx={{ fontWeight: 600 }}
            >
              Sort by
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {sortOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => handleSortClick(option.value)}
                  variant={
                    selectedSortBy === option.value ? "filled" : "outlined"
                  }
                  color={
                    selectedSortBy === option.value ? "secondary" : "default"
                  }
                  size="small"
                  sx={{
                    mb: 1,
                    "&:hover": {
                      backgroundColor:
                        selectedSortBy === option.value
                          ? "secondary.dark"
                          : "action.hover", // Uses your theme's action hover color
                    },
                    ...(selectedSortBy === option.value && {
                      backgroundColor: "secondary.main",
                      color: "secondary.contrastText",
                      "& .MuiChip-deleteIcon": {
                        color: "secondary.contrastText",
                      },
                    }),
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </Collapse>

      {/* Always visible selected filters summary */}
      {!isExpanded && (selectedCategories.length > 0 || selectedSortBy) && (
        <Box mt={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedCategories.length > 0 &&
              !selectedCategories.includes("All News") && (
                <Typography variant="caption" color="text.secondary">
                  {selectedCategories.length} categor
                  {selectedCategories.length === 1 ? "y" : "ies"}
                </Typography>
              )}
            {selectedSortBy && selectedSortBy !== "latest" && (
              <Typography variant="caption" color="text.secondary">
                •{" "}
                {sortOptions.find((opt) => opt.value === selectedSortBy)?.label}
              </Typography>
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default NewsFilters;
