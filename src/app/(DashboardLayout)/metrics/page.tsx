"use client";
import { useTheme } from "@mui/material/styles";
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
  Legend,
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

interface ChartData {
  name: string;
  count: number;
  binIndex: number;
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
}

type MetricConfig = HistogramConfig | SingleValueConfig;

interface MetricSummaryAggregation {
  avg_value: number;
  sum_value: number;
  count: number;
  min_value: number;
  max_value: number;
}

interface HistogramProps {
  config: HistogramConfig;
  selectedDays: number;
  selectedPredictionType: string;
}

interface SingleValueProps {
  config: SingleValueConfig;
  selectedDays: number;
  selectedPredictionType: string;
}

// Single Value Metric Component
const SingleValueMetric: React.FC<SingleValueProps> = ({
  config,
  selectedDays,
  selectedPredictionType,
}) => {
  const theme = useTheme();
  const [aggregation, setAggregation] =
    useState<MetricSummaryAggregation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregation = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        metric_name: config.metricName,
        num_days: selectedDays.toString(),
        prediction_type: selectedPredictionType,
      };

      const response = await fetch(
        buildApiUrl(
          ENDPOINTS.METRICS_SUMMARY || ENDPOINTS.METRICS_BINS,
          params,
        ),
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
        const defaultAggregation: MetricSummaryAggregation = {
          avg_value: 0,
          sum_value: 0,
          count: 0,
          min_value: 0,
          max_value: 0,
        };
        setAggregation(defaultAggregation);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MetricSummaryAggregation = await response.json();
      setAggregation(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to fetch ${config.title}`,
      );
      console.error(`Error fetching ${config.title}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregation();
  }, [selectedPredictionType, selectedDays, config.metricName]);

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

  const renderValues = () => {
    if (!aggregation) return null;

    const primaryValue = config.values.find((v) => v.isPrimary);
    const secondaryValues = config.values.filter((v) => !v.isPrimary);
    const isVertical = config.layout === "vertical";

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isVertical ? 2 : 3,
          minHeight: "120px",
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* Primary Value (if specified) */}
        {primaryValue && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: isVertical ? "none" : 1,
            }}
          >
            <Box
              sx={{
                fontSize: isVertical ? "2.5rem" : "2rem",
                fontWeight: "bold",
                color: primaryValue.color || theme.palette.primary.main,
                lineHeight: 1,
              }}
            >
              {formatDisplayValue(
                aggregation[primaryValue.field],
                primaryValue,
              )}
            </Box>
            <Box
              sx={{
                fontSize: "0.875rem",
                color: theme.palette.text.secondary,
                mt: 0.5,
                fontWeight: 500,
              }}
            >
              {primaryValue.label}
            </Box>
          </Box>
        )}

        {/* Secondary Values */}
        {secondaryValues.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: isVertical ? "row" : "column",
              gap: isVertical ? 2 : 1,
              flex: isVertical ? "none" : 1,
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {secondaryValues.map((valueConfig, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: isVertical ? "80px" : "auto",
                }}
              >
                <Box
                  sx={{
                    fontSize: primaryValue ? "1.25rem" : "2rem",
                    fontWeight: primaryValue ? "600" : "bold",
                    color: valueConfig.color || theme.palette.text.primary,
                    lineHeight: 1,
                  }}
                >
                  {formatDisplayValue(
                    aggregation[valueConfig.field],
                    valueConfig,
                  )}
                </Box>
                <Box
                  sx={{
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary,
                    mt: 0.25,
                    textAlign: "center",
                  }}
                >
                  {valueConfig.label}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* If no primary value, display all values equally */}
        {!primaryValue &&
          config.values.map((valueConfig, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Box
                sx={{
                  fontSize: config.values.length === 1 ? "2.5rem" : "1.5rem",
                  fontWeight: "bold",
                  color: valueConfig.color || theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                {formatDisplayValue(
                  aggregation[valueConfig.field],
                  valueConfig,
                )}
              </Box>
              <Box
                sx={{
                  fontSize: "0.75rem",
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                  textAlign: "center",
                }}
              >
                {valueConfig.label}
              </Box>
            </Box>
          ))}
      </Box>
    );
  };

  return (
    <DashboardCard title={`${config.title}`}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="120px"
        >
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading {config.title.toLowerCase()}: {error}
        </Alert>
      ) : (
        renderValues()
      )}
    </DashboardCard>
  );
};
const MetricHistogram: React.FC<HistogramProps> = ({
  config,
  selectedDays,
  selectedPredictionType,
}) => {
  const theme = useTheme();
  const [histogramData, setHistogramData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistogramData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        metric_name: config.metricName,
        num_bins: config.numBins.toString(),
        num_days: selectedDays.toString(),
        // Add prediction type if needed for filtering
        prediction_type: selectedPredictionType,
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MetricBinsResponse = await response.json();

      const chartData: ChartData[] = data.metric_bins.map((bin) => ({
        name: config.formatBinLabel
          ? config.formatBinLabel(bin)
          : `${bin.bin_start} - ${bin.bin_end}`,
        count: bin.count,
        binIndex: bin.bin_index,
      }));

      setHistogramData(chartData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to fetch ${config.title} data`,
      );
      console.error(`Error fetching ${config.title} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistogramData();
  }, [selectedPredictionType, selectedDays, config.metricName]);

  return (
    <Box sx={{ mt: 3 }}>
      <DashboardCard title={`${config.title}`}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading {config.title.toLowerCase()}: {error}
          </Alert>
        ) : (
          <Box sx={{ width: "100%", height: 400, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={histogramData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis
                  label={{
                    value: config.yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, _name) => [value, "Count"]}
                  labelFormatter={(label) => {
                    const item = histogramData.find((d) => d.name === label);
                    return item ? `Bin ${item.binIndex + 1}: ${label}` : label;
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill={config.color || theme.palette.primary.main}
                  name={config.barName}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </DashboardCard>
    </Box>
  );
};

// Main Page Component
const DeploymentsPage = () => {
  const theme = useTheme();
  const [selectedPredictionType, setSelectedPredictionType] =
    useState<string>("sentiment_analysis");
  const [selectedDays, setSelectedDays] = useState<number>(14);

  const handlePredictionTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedPredictionType(event.target.value);
  };

  const handleDaysChange = (event: SelectChangeEvent<string>) => {
    setSelectedDays(parseInt(event.target.value));
  };

  // Configuration for all metrics - easy to add new ones here!
  const metricConfigs: MetricConfig[] = [
    {
      type: "single_value",
      metricName: "predictor_latency",
      title: "Inference Summary",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Requests",
          formatValue: (value) => `${value}`,
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
          formatValue: (value) => `${value.toFixed(1)}s`,
          color: theme.palette.success.main,
        },
        {
          field: "max_value",
          label: "Max",
          formatValue: (value) => `${value.toFixed(1)}s`,
          color: theme.palette.error.main,
        },
      ],
    },
    {
      type: "single_value",
      metricName: "predictor_loading_latency",
      title: "Loading Latency Summary",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Loading count",
          formatValue: (value) => `${value}`,
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
          formatValue: (value) => `${value.toFixed(1)}s`,
          color: theme.palette.success.main,
        },
        {
          field: "max_value",
          label: "Max",
          formatValue: (value) => `${value.toFixed(1)}s`,
          color: theme.palette.error.main,
        },
      ],
    },
    {
      type: "single_value",
      metricName: "predictor_error",
      title: "Inference Predictor Errors",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Count",
          formatValue: (value) => `${value.toFixed(2)}`,
          color: theme.palette.error.main,
          isPrimary: true,
        },
      ],
    },
    {
      type: "single_value",
      metricName: "predictor_loading_error",
      title: "Predictor Loading Errors",
      layout: "horizontal",
      values: [
        {
          field: "count",
          label: "Count",
          formatValue: (value) => `${value.toFixed(2)}`,
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
      formatBinLabel: (bin) => `${bin.bin_start}s - ${bin.bin_end}s`,
      color: theme.palette.primary.main,
    },
    {
      type: "histogram",
      metricName: "predictor_loading_latency",
      title: "Predictor Loading Latency Distribution",
      yAxisLabel: "Count",
      barName: "Predictor loading latency",
      numBins: 10,
      formatBinLabel: (bin) => `${bin.bin_start}s - ${bin.bin_end}s`,
      color: theme.palette.primary.main,
    },
  ];

  return (
    <PageContainer
      title="Deployments"
      description="Monitor and manage your ML model deployments"
    >
      <Box>
        {/* Filter Section */}
        <DashboardCard title="Deployment Filters">
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
                  <MenuItem value="sentiment_analysis">
                    Sentiment Analysis
                  </MenuItem>
                  <MenuItem value="text_classification">
                    Text Classification
                  </MenuItem>
                  <MenuItem value="image_recognition">
                    Image Recognition
                  </MenuItem>
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
          </Box>
        </DashboardCard>

        {/* Render all metrics in a responsive grid */}
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", // 1 column on extra small screens
                sm: "1fr", // 1 column on small screens
                md: "1fr 1fr", // 2 columns on medium screens
                lg: "repeat(3, 1fr)", // 3 columns on large screens
                xl: "repeat(4, 1fr)", // 4 columns on extra large screens
              },
              gap: 3,
            }}
          >
            {metricConfigs.map((config, index) => {
              if (config.type === "histogram") {
                return (
                  <Box
                    key={`${config.metricName}-${index}`}
                    sx={{
                      gridColumn: {
                        xs: "span 1",
                        sm: "span 1",
                        md: "span 2", // Histograms take 2 columns on medium+
                        lg: "span 2", // Histograms take 2 columns on large
                        xl: "span 2", // Histograms take 2 columns on xl
                      },
                    }}
                  >
                    <MetricHistogram
                      config={config}
                      selectedDays={selectedDays}
                      selectedPredictionType={selectedPredictionType}
                    />
                  </Box>
                );
              } else {
                return (
                  <SingleValueMetric
                    key={`${config.metricName}-${index}`}
                    config={config}
                    selectedDays={selectedDays}
                    selectedPredictionType={selectedPredictionType}
                  />
                );
              }
            })}
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default DeploymentsPage;
