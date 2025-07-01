"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Checkbox, ListItemText } from "@mui/material";
import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { buildApiUrl, ENDPOINTS } from "@/config/api";

interface MetricBin {
  bin_index: number;
  bin_start: number;
  bin_end: number;
  count: number;
}

interface MetricBinsResponse {
  metric_bins: MetricBin[];
}

interface HistogramConfig {
  type: "histogram";
  metricName: string;
  title: string;
  yAxisLabel: string;
  barName: string;
  numBins: number;
  formatBinLabel?: (bin: MetricBin) => string;
  color?: string;
}

interface SingleValueConfig {
  type: "single_value";
  metricName: string;
  title: string;
  values: {
    field: "avg_value" | "sum_value" | "count" | "min_value" | "max_value";
    label: string;
    unit?: string;
    formatValue?: (value: number) => string;
    color?: string;
    isPrimary?: boolean;
    defaultValue?: number | null;
  }[];
  layout?: "horizontal" | "vertical";
  showAsTable?: boolean;
}

type MetricConfig = HistogramConfig | SingleValueConfig;

interface MetricSummaryAggregation {
  avg_value: number;
  sum_value: number;
  count: number;
  min_value: number;
  max_value: number;
}

interface PredictionTypesResponse {
  prediction_types: string[];
}

interface HistogramProps {
  config: HistogramConfig;
  selectedDays: number;
  selectedPredictionType: string;
  selectedVersions: number[];
  availableVersions: PredictorDocument[];
}

interface SingleValueProps {
  config: SingleValueConfig;
  selectedDays: number;
  selectedPredictionType: string;
  selectedVersions: number[];
  availableVersions: PredictorDocument[];
}

interface PredictorDocument {
  _id: { $oid: string };
  prediction_type: string;
  predictor_version: number;
  predictor_description: string;
  traffic_percentage: number;
  created_at: { $date: { $numberLong: string } };
  updated_at: { $date: { $numberLong: string } };
}

interface PredictorsResponse {
  prediction_type: string;
  predictors: PredictorDocument[];
}

interface VersionMetricData {
  version: number;
  aggregation: MetricSummaryAggregation;
  traffic_percentage: number;
}

// Single Value Metric Component
const SingleValueMetric: React.FC<SingleValueProps> = ({
  config,
  selectedDays,
  selectedPredictionType,
  selectedVersions,
  availableVersions,
}) => {
  const theme = useTheme();
  const [versionData, setVersionData] = useState<VersionMetricData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersionsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data for each selected version
      const promises = selectedVersions.map(async (version) => {
        const params = {
          metric_name: config.metricName,
          num_days: selectedDays.toString(),
          prediction_type: selectedPredictionType,
          predictor_version: version.toString(),
        };

        const response = await fetch(
          buildApiUrl(ENDPOINTS.METRICS_SUMMARY, params),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
          },
        );

        if (response.status === 404) {
          return {
            version,
            aggregation: {
              avg_value: 0,
              sum_value: 0,
              count: 0,
              min_value: 0,
              max_value: 0,
            },
            traffic_percentage: 0,
          };
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MetricSummaryAggregation = await response.json();

        // Get traffic percentage from availableVersions
        const predictor = availableVersions.find(
          (p) => p.predictor_version === version,
        );

        return {
          version,
          aggregation: data,
          traffic_percentage: predictor?.traffic_percentage || 0,
        };
      });

      const results = await Promise.all(promises);
      setVersionData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVersions.length > 0) {
      fetchVersionsData();
    }
  }, [
    selectedVersions,
    selectedDays,
    selectedPredictionType,
    config.metricName,
  ]);

  const formatDisplayValue = (
    value: number,
    valueConfig: (typeof config.values)[0],
  ) => {
    const displayValue =
      value === 0 && valueConfig.defaultValue !== undefined
        ? valueConfig.defaultValue
        : value;

    if (displayValue === null || displayValue === undefined) {
      return "N/A";
    }

    if (valueConfig.formatValue) {
      return valueConfig.formatValue(displayValue);
    }
    return valueConfig.unit
      ? `${displayValue.toLocaleString()} ${valueConfig.unit}`
      : displayValue.toLocaleString();
  };

  return (
    <Box>
      <DashboardCard title={config.title}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : versionData.length === 0 ? (
          <Box p={3}>
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Version</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Traffic %</strong>
                  </TableCell>
                  {config.values.map((value) => (
                    <TableCell key={value.field} align="right">
                      <strong>{value.label}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {versionData.map((data) => (
                  <TableRow key={data.version}>
                    <TableCell>
                      <Chip
                        label={`V${data.version}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${data.traffic_percentage}%`}
                        size="small"
                        color={
                          data.traffic_percentage > 0 ? "success" : "default"
                        }
                      />
                    </TableCell>
                    {config.values.map((value) => {
                      const rawValue = data.aggregation[value.field];
                      const formattedValue = value.formatValue
                        ? value.formatValue(rawValue)
                        : rawValue.toString();

                      return (
                        <TableCell key={value.field} align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: value.isPrimary ? "bold" : "normal",
                              color: value.isPrimary
                                ? "primary.main"
                                : "text.primary",
                            }}
                          >
                            {formattedValue}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DashboardCard>
    </Box>
  );
};

const MetricHistogram: React.FC<HistogramProps> = ({
  config,
  selectedDays,
  selectedPredictionType,
  selectedVersions,
  availableVersions,
}) => {
  const theme = useTheme();
  const [versionHistograms, setVersionHistograms] = useState<
    {
      version: number;
      bins: MetricBin[];
      traffic_percentage: number;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistogramsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = selectedVersions.map(async (version) => {
        const params = {
          metric_name: config.metricName,
          num_days: selectedDays.toString(),
          prediction_type: selectedPredictionType,
          predictor_version: version.toString(),
          num_bins: config.numBins.toString(),
        };

        const response = await fetch(
          buildApiUrl(ENDPOINTS.METRICS_BINS, params),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
          },
        );

        if (response.status === 404) {
          return {
            version,
            bins: [],
            traffic_percentage: 0,
          };
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MetricBinsResponse = await response.json();
        const predictor = availableVersions.find(
          (p) => p.predictor_version === version,
        );

        return {
          version,
          bins: data.metric_bins,
          traffic_percentage: predictor?.traffic_percentage || 0,
        };
      });

      const results = await Promise.all(promises);
      setVersionHistograms(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistogramsData();
  }, [
    selectedPredictionType,
    selectedDays,
    selectedVersions,
    config.metricName,
  ]);

  return (
    <Box>
      <DashboardCard title={config.title}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : versionHistograms.length === 0 ? (
          <Box p={3}>
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {versionHistograms.map((vh, index) => (
              <Box
                key={vh.version}
                sx={{ mb: index < versionHistograms.length - 1 ? 3 : 0 }}
              >
                {/* Version Header */}
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}
                >
                  <Chip
                    label={`Version ${vh.version}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${vh.traffic_percentage}% traffic`}
                    size="small"
                    color={vh.traffic_percentage > 0 ? "success" : "default"}
                  />
                </Box>

                {/* Individual Histogram */}
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={vh.bins.map((bin) => ({
                        name: config.formatBinLabel
                          ? config.formatBinLabel(bin)
                          : `Bin ${bin.bin_index + 1}`,
                        count: bin.count,
                        binIndex: bin.bin_index,
                      }))}
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        label={{
                          value: config.yAxisLabel,
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value, name) => [value, config.barName]}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item && config.formatBinLabel
                            ? config.formatBinLabel(vh.bins[item.binIndex])
                            : label;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={config.color || theme.palette.primary.main}
                        name={config.barName}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DashboardCard>
    </Box>
  );
};

// Main Page Component
const MetricsPage = () => {
  const theme = useTheme();
  const [selectedPredictionType, setSelectedPredictionType] =
    useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number>(14);

  // State for dynamic options
  const [predictionTypes, setPredictionTypes] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [availableVersions, setAvailableVersions] = useState<
    PredictorDocument[]
  >([]);

  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [predictors, setPredictors] = useState<PredictorDocument[]>([]);

  // Fetch prediction types
  const fetchPredictionTypes = async () => {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.PREDICTOR_TYPES), {
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

      const data: PredictionTypesResponse = await response.json();
      setPredictionTypes(data.prediction_types);

      // Set default selection if available
      if (data.prediction_types.length > 0 && !selectedPredictionType) {
        setSelectedPredictionType(data.prediction_types[0]);
      }
    } catch (err) {
      setOptionsError(
        err instanceof Error ? err.message : "Failed to fetch prediction types",
      );
      console.error("Error fetching prediction types:", err);
    }
  };

  // Fetch versions for selected prediction type
  const fetchPredictors = async (predictionType: string) => {
    if (!predictionType) return;

    try {
      const params: Record<string, string | number | boolean> = {
        prediction_type: predictionType,
      };

      if (showActiveOnly) {
        params.min_traffic = 1;
      }

      const response = await fetch(buildApiUrl(ENDPOINTS.PREDICTORS, params), {
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

      const data: PredictorsResponse = await response.json();
      setPredictors(data.predictors);
      setAvailableVersions(data.predictors);

      const allVersions = data.predictors.map((p) => p.predictor_version);
      setSelectedVersions(allVersions);
    } catch (err) {
      setOptionsError(
        err instanceof Error ? err.message : "Failed to fetch versions",
      );
      console.error("Error fetching versions:", err);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingOptions(true);
      setOptionsError(null);

      await fetchPredictionTypes();
      setLoadingOptions(false);
    };

    loadInitialData();
  }, []);

  // Fetch versions when prediction type changes
  useEffect(() => {
    if (selectedPredictionType) {
      fetchPredictors(selectedPredictionType);
    } else {
      setAvailableVersions([]);
      setSelectedVersions([]);
    }
  }, [selectedPredictionType, showActiveOnly]);

  const handlePredictionTypeChange = (event: SelectChangeEvent<string>) => {
    const newPredictionType = event.target.value;
    setSelectedPredictionType(newPredictionType);
    setSelectedVersions([]);
    setAvailableVersions([]);
  };

  const handleVersionsChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[];
    setSelectedVersions(value);
  };
  const handleDaysChange = (event: SelectChangeEvent<string>) => {
    setSelectedDays(parseInt(event.target.value));
  };

  const metricConfigs: MetricConfig[] = [
    {
      type: "single_value",
      metricName: "predictor_latency",
      title: "Inference",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Requests",
          formatValue: (value) => `${value.toFixed(0)}`,
          color: theme.palette.primary.main,
          isPrimary: true,
        },
        {
          field: "avg_value",
          label: "Average",
          formatValue: (value) => `${value.toFixed(2)}s`,
          color: theme.palette.primary.main,
          isPrimary: false,
        },
        {
          field: "min_value",
          label: "Min",
          formatValue: (value) => `${value.toFixed(2)}s`,
          color: theme.palette.success.main,
        },
        {
          field: "max_value",
          label: "Max",
          formatValue: (value) => `${value.toFixed(2)}s`,
          color: theme.palette.error.main,
        },
      ],
    },
    {
      type: "single_value",
      metricName: "predictor_loading_latency",
      title: "Loading Latency",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Count",
          formatValue: (value) => `${value.toFixed(0)}`,
          color: theme.palette.primary.main,
          isPrimary: true,
        },
        {
          field: "avg_value",
          label: "Average",
          formatValue: (value) => `${value.toFixed(2)}s`,
          color: theme.palette.primary.main,
          isPrimary: false,
        },
        {
          field: "min_value",
          label: "Min",
          formatValue: (value) => `${value.toFixed(2)}s`,
          color: theme.palette.success.main,
        },
        {
          field: "max_value",
          label: "Max",
          formatValue: (value) => `${value.toFixed(2)}s`,
          color: theme.palette.error.main,
        },
      ],
    },
    {
      type: "single_value",
      metricName: "predictor_error",
      title: "Inference Errors",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Count",
          formatValue: (value) => `${value.toFixed(0)}`,
          color: theme.palette.error.main,
          isPrimary: true,
        },
      ],
    },
    {
      type: "single_value",
      metricName: "predictor_loading_error",
      title: "Loading Errors",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Count",
          formatValue: (value) => `${value.toFixed(0)}`,
          color: theme.palette.error.main,
          isPrimary: true,
        },
      ],
    },
    {
      type: "histogram",
      metricName: "predictor_latency",
      title: "Predictor Latency Distribution",
      yAxisLabel: "Count",
      barName: "Predictor latency",
      numBins: 10,
      formatBinLabel: (bin) =>
        `${bin.bin_start.toFixed(2)}s - ${bin.bin_end.toFixed(2)}s`,
      color: theme.palette.primary.main,
    },
    {
      type: "histogram",
      metricName: "predictor_loading_latency",
      title: "Predictor Loading Latency Distribution",
      yAxisLabel: "Count",
      barName: "Predictor loading latency",
      numBins: 10,
      formatBinLabel: (bin) =>
        `${bin.bin_start.toFixed(2)}s - ${bin.bin_end.toFixed(2)}s`,
      color: theme.palette.primary.main,
    },
    {
      type: "histogram",
      metricName: "predictor_price",
      title: "Predictor Price Per Call Distribution",
      yAxisLabel: "Count",
      barName: "Predictor price per call",
      numBins: 10,
      formatBinLabel: (bin) =>
        `${bin.bin_start.toFixed(2)}$ - ${bin.bin_end.toFixed(2)}$`,
      color: theme.palette.primary.main,
    },
  ];

  // Don't render metrics until we have the required filters selected
  const shouldRenderMetrics =
    selectedPredictionType && selectedVersions.length > 0;

  return (
    <PageContainer
      title="Metrics"
      description="Monitor and manage your ML model deployments"
    >
      <Box>
        {/* Filter Section */}
        <DashboardCard title="Metric Filters">
          {loadingOptions ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="80px"
            >
              <CircularProgress size={30} />
            </Box>
          ) : optionsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading filter options: {optionsError}
            </Alert>
          ) : (
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel id="prediction-type-label">
                    Prediction Type
                  </InputLabel>
                  <Select
                    labelId="prediction-type-label"
                    id="prediction-type-select"
                    value={selectedPredictionType}
                    label="Prediction Type"
                    onChange={handlePredictionTypeChange}
                  >
                    {predictionTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth disabled={!selectedPredictionType}>
                  <InputLabel id="versions-label">Versions</InputLabel>
                  <Select
                    labelId="versions-label"
                    id="versions-select"
                    multiple
                    value={selectedVersions}
                    label="Versions"
                    onChange={(event) => {
                      const value = event.target.value as number[];
                      setSelectedVersions(value);
                    }}
                    renderValue={(selected) =>
                      selected.length === availableVersions.length
                        ? "All Versions"
                        : `${selected.length} selected`
                    }
                  >
                    {availableVersions.map((predictor) => (
                      <MenuItem
                        key={predictor.predictor_version}
                        value={predictor.predictor_version}
                      >
                        <Checkbox
                          checked={selectedVersions.includes(
                            predictor.predictor_version,
                          )}
                        />
                        <ListItemText
                          primary={`Version ${predictor.predictor_version}`}
                          secondary={`Traffic: ${predictor.traffic_percentage}%`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <FormControl fullWidth>
                  <InputLabel id="days-label">Time Period</InputLabel>
                  <Select
                    labelId="days-label"
                    id="days-select"
                    value={selectedDays.toString()}
                    label="Time Period"
                    onChange={handleDaysChange}
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => (
                      <MenuItem key={day} value={day.toString()}>
                        {day} {day === 1 ? "day" : "days"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <FormControl fullWidth>
                  <InputLabel id="active-filter-label">
                    Show Predictors
                  </InputLabel>
                  <Select
                    labelId="active-filter-label"
                    id="active-filter-select"
                    value={showActiveOnly ? "active" : "all"}
                    label="Show Predictors"
                    onChange={(event) =>
                      setShowActiveOnly(event.target.value === "active")
                    }
                  >
                    <MenuItem value="active">
                      Active Only (Traffic ≥ 1%)
                    </MenuItem>
                    <MenuItem value="all">All Predictors</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </DashboardCard>
        {/* Render metrics only when filters are selected */}
        {shouldRenderMetrics ? (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr", // 1 column on mobile
                  sm: "1fr", // 1 column on small screens
                  md: "repeat(2, 1fr)", // 2 columns on medium and up
                },
                gap: 3,
              }}
            >
              {metricConfigs.map((config, index) => {
                if (config.type === "histogram") {
                  return (
                    <MetricHistogram
                      key={`${config.metricName}-${index}`}
                      config={config}
                      selectedDays={selectedDays}
                      selectedPredictionType={selectedPredictionType}
                      selectedVersions={selectedVersions}
                      availableVersions={availableVersions}
                    />
                  );
                } else {
                  return (
                    <SingleValueMetric
                      key={`${config.metricName}-${index}`}
                      config={config}
                      selectedDays={selectedDays}
                      selectedPredictionType={selectedPredictionType}
                      selectedVersions={selectedVersions}
                      availableVersions={availableVersions}
                    />
                  );
                }
              })}
            </Box>
          </Box>
        ) : (
          !loadingOptions &&
          !optionsError && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                Please select both a prediction type and versions to view
                metrics.
              </Alert>
            </Box>
          )
        )}
      </Box>
    </PageContainer>
  );
};

export default MetricsPage;
