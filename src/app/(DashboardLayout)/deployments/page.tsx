"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  Badge,
  Stack,
  useTheme,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  IconRocket,
  IconHistory,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
  IconActivity,
  IconClock,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconPlayerPlay,
  IconRestore,
  IconUsers,
  IconTrendingUp,
  IconDatabase,
  IconPlayerPause,
} from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { buildApiUrl, ENDPOINTS } from "@/config/api";

// Backend data interfaces
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

interface PredictionTypesResponse {
  prediction_types: string[];
}

// Updated TrafficMetric interface to include optional description
interface TrafficMetric {
  _id: { $oid: string };
  metric_name: string;
  metric_value: number;
  description?: string; // Optional field added
  tags: {
    prediction_type: string;
    predictor_version: string;
  };
  created_at: { $date: { $numberLong: string } };
  updated_at: { $date: { $numberLong: string } };
}

interface TrafficMetricsResponse {
  metrics: TrafficMetric[];
}

interface DeploymentVersion {
  id: string;
  version: number;
  algorithm: string;
  trafficPercentage: number;
  status: "active" | "inactive";
  description: string;
  deployedAt: string;
}

// Updated ABTestLog interface to support multiple action types
interface ABTestLog {
  id: string;
  timestamp: string;
  action: "traffic_update" | "traffic_deactivation";
  version: string;
  trafficValue: number;
  reason: string;
  status: "success";
  predictionType: string;
}

const DeploymentCard: React.FC<{ deployment: DeploymentVersion }> = ({
  deployment,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.palette.success.main;
      case "inactive":
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <IconCheck size={16} />;
      case "inactive":
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Version {deployment.version}
            </Typography>
            <Chip
              icon={getStatusIcon(deployment.status)}
              label={deployment.status.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getStatusColor(deployment.status),
                color: "white",
                fontWeight: 600,
                "& .MuiChip-icon": {
                  color: "white",
                },
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          >
            {deployment.trafficPercentage}%
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={deployment.trafficPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor: getStatusColor(deployment.status),
              },
            }}
          />
        </Box>

        {/* Display description if available */}
        {deployment.description && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              {deployment.description}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {new Date(deployment.deployedAt).toLocaleDateString()}
          </Typography>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={
              expanded ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )
            }
            sx={{ color: theme.palette.text.secondary }}
          >
            {expanded ? "Hide Details" : "Show Details"}
          </Button>
        </Box>

        {expanded && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Deployment ID: {deployment.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Algorithm: {deployment.algorithm}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Updated: {new Date(deployment.deployedAt).toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ABTestLogEntry: React.FC<{ log: ABTestLog }> = ({ log }) => {
  const theme = useTheme();

  const getActionIcon = (action: string) => {
    switch (action) {
      case "traffic_update":
        return <IconTrendingUp size={16} />;
      case "traffic_deactivation":
        return <IconPlayerPause size={16} />;
      default:
        return <IconActivity size={16} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "traffic_update":
        return theme.palette.primary.main;
      case "traffic_deactivation":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "traffic_update":
        return "TRAFFIC UPDATE";
      case "traffic_deactivation":
        return "TRAFFIC DEACTIVATION";
      default:
        return action.toUpperCase();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          transform: "translateX(4px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: theme.palette.grey[100],
          color: getActionColor(log.action),
        }}
      >
        {getActionIcon(log.action)}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {getActionLabel(log.action)} to {log.version}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {log.reason}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(log.timestamp).toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ textAlign: "right" }}>
        <Chip
          label={log.status.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.success.main,
            fontWeight: 600,
            mb: 1,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: getActionColor(log.action),
            fontWeight: 600,
          }}
        >
          {log.trafficValue}%
        </Typography>
      </Box>
    </Box>
  );
};

const DeploymentTrafficSummary: React.FC<{
  deployments: DeploymentVersion[];
}> = ({ deployments }) => {
  const theme = useTheme();

  const activeDeployments = deployments.filter(
    (d) => d.status === "active" && d.trafficPercentage > 0,
  );
  const sortedDeployments = [...activeDeployments].sort(
    (a, b) => b.trafficPercentage - a.trafficPercentage,
  );

  return (
    <DashboardCard
      title="Traffic Distribution"
      description="Real-time traffic allocation across active deployments"
    >
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {sortedDeployments.slice(0, 4).map((deployment, index) => (
            <Grid key={deployment.id} size={{ xs: 6, sm: 3 }}>
              <Tooltip
                title={`Version ${deployment.version} - ${deployment.algorithm}`}
                placement="top"
              >
                <Box sx={{ textAlign: "center", cursor: "pointer" }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      backgroundColor: theme.palette.success.dark,
                      color: "white",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {deployment.trafficPercentage}%
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, textAlign: "center" }}
                  >
                    v{deployment.version}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    {deployment.algorithm}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Summary Stats */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={2} sx={{ justifyContent: "center" }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
                >
                  {activeDeployments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Deployments
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ color: theme.palette.success.dark, fontWeight: 700 }}
                >
                  {Math.round(
                    activeDeployments.reduce(
                      (sum, d) => sum + d.trafficPercentage,
                      0,
                    ),
                  )}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Traffic
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardCard>
  );
};

const DeploymentsPage: React.FC = () => {
  const theme = useTheme();
  const [deployments, setDeployments] = useState<DeploymentVersion[]>([]);
  const [predictionTypes, setPredictionTypes] = useState<string[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [abTestLogs, setAbTestLogs] = useState<ABTestLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogTab, setSelectedLogTab] = useState(0);

  // Updated function to fetch traffic update logs with description support
  const fetchTrafficUpdateLogs = async (
    predictionType: string,
    limit: number = 10,
  ) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        metric_name: "predictor_traffic_update",
        prediction_type: predictionType,
      });

      const response = await fetch(
        buildApiUrl(ENDPOINTS.METRICS, Object.fromEntries(params)),
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

      const data: TrafficMetricsResponse = await response.json();

      // Transform backend data to ABTestLog format with description support
      const transformedLogs: ABTestLog[] = data.metrics.map((metric) => ({
        id: metric._id.$oid,
        timestamp: new Date(
          parseInt(metric.created_at.$date.$numberLong),
        ).toISOString(),
        action: "traffic_update",
        version: `v${metric.tags.predictor_version}`,
        trafficValue: metric.metric_value,
        reason: metric.description || "Traffic allocation updated", // Use description if available
        status: "success",
        predictionType: metric.tags.prediction_type,
      }));

      return transformedLogs;
    } catch (err) {
      console.error("Error fetching traffic update logs:", err);
      return [];
    }
  };

  // New function to fetch traffic deactivation logs
  const fetchTrafficDeactivationLogs = async (
    predictionType: string,
    limit: number = 10,
  ) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        metric_name: "predictor_traffic_deactivation",
        prediction_type: predictionType,
      });

      const response = await fetch(
        buildApiUrl(ENDPOINTS.METRICS, Object.fromEntries(params)),
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

      const data: TrafficMetricsResponse = await response.json();

      // Transform backend data to ABTestLog format
      const transformedLogs: ABTestLog[] = data.metrics.map((metric) => ({
        id: metric._id.$oid,
        timestamp: new Date(
          parseInt(metric.created_at.$date.$numberLong),
        ).toISOString(),
        action: "traffic_deactivation",
        version: `v${metric.tags.predictor_version}`,
        trafficValue: metric.metric_value,
        reason: metric.description || "Traffic deactivated", // Use description if available
        status: "success",
        predictionType: metric.tags.prediction_type,
      }));

      return transformedLogs;
    } catch (err) {
      console.error("Error fetching traffic deactivation logs:", err);
      return [];
    }
  };

  // Combined function to fetch all logs
  const fetchAllLogs = async (predictionType: string, limit: number = 10) => {
    const [updateLogs, deactivationLogs] = await Promise.all([
      fetchTrafficUpdateLogs(predictionType, limit),
      fetchTrafficDeactivationLogs(predictionType, limit),
    ]);

    // Combine and sort logs by timestamp (newest first)
    const allLogs = [...updateLogs, ...deactivationLogs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return allLogs.slice(0, limit); // Return only the requested number of logs
  };

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
      if (data.prediction_types.length > 0 && !selectedAlgorithm) {
        setSelectedAlgorithm(data.prediction_types[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prediction types",
      );
      console.error("Error fetching prediction types:", err);
    }
  };

  const fetchPredictors = async (predictionType: string) => {
    if (!predictionType) return;

    try {
      const response = await fetch(
        buildApiUrl(ENDPOINTS.PREDICTORS, {
          prediction_type: predictionType,
        }),
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

      const data: PredictorsResponse = await response.json();

      // Transform backend data to our component format
      const transformedDeployments: DeploymentVersion[] = data.predictors.map(
        (predictor) => ({
          id: predictor._id.$oid,
          version: predictor.predictor_version,
          algorithm: predictor.prediction_type,
          trafficPercentage: predictor.traffic_percentage,
          status: predictor.traffic_percentage > 0 ? "active" : "inactive",
          description: predictor.predictor_description,
          deployedAt: new Date(
            parseInt(predictor.created_at.$date.$numberLong),
          ).toISOString(),
        }),
      );

      setDeployments(transformedDeployments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch predictors",
      );
      console.error("Error fetching predictors:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchPredictionTypes();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch initial data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAlgorithm) {
      fetchPredictors(selectedAlgorithm);
    }
  }, [selectedAlgorithm]);

  useEffect(() => {
    if (selectedAlgorithm) {
      const fetchLogs = async () => {
        setLogsLoading(true);
        const logs = await fetchAllLogs(selectedAlgorithm);
        setAbTestLogs(logs);
        setLogsLoading(false);
      };

      fetchLogs();
    }
  }, [selectedAlgorithm]);

  const filteredDeployments = deployments.filter(
    (d) => d.algorithm === selectedAlgorithm,
  );

  const getFilteredLogsByTab = () => {
    switch (selectedLogTab) {
      case 0: // All
        return abTestLogs;
      case 1: // Updates
        return abTestLogs.filter((log) => log.action === "traffic_update");
      case 2: // Deactivations
        return abTestLogs.filter(
          (log) => log.action === "traffic_deactivation",
        );
      default:
        return abTestLogs;
    }
  };

  if (loading) {
    return (
      <PageContainer
        title="Deployments"
        description="Manage your ML model deployments"
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={40} />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        title="Deployments"
        description="Manage your ML model deployments"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading deployments: {error}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Deployments"
      description="Manage your ML model deployments"
    >
      <Box>
        {/* Traffic Distribution Summary */}
        <DeploymentTrafficSummary deployments={filteredDeployments} />

        {/* Algorithm Filter */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {predictionTypes.map((algorithm) => (
              <Chip
                key={algorithm}
                label={algorithm.replace("_", " ").toUpperCase()}
                onClick={() => setSelectedAlgorithm(algorithm)}
                variant={
                  selectedAlgorithm === algorithm ? "filled" : "outlined"
                }
                color={selectedAlgorithm === algorithm ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Deployments Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {filteredDeployments.map((deployment) => (
            <Grid key={deployment.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <DeploymentCard deployment={deployment} />
            </Grid>
          ))}
        </Grid>

        {/* Traffic Activity Log with Tabs */}
        <DashboardCard
          title="Traffic Activity History"
          description="Recent traffic allocation changes and deactivations"
        >
          <Box sx={{ p: 2 }}>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={selectedLogTab}
                onChange={(_, newValue) => setSelectedLogTab(newValue)}
                variant="fullWidth"
              >
                <Tab label="All Activity" />
                <Tab label="Traffic Updates" />
                <Tab label="Deactivations" />
              </Tabs>
            </Box>

            {logsLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="200px"
              >
                <CircularProgress size={24} />
              </Box>
            ) : getFilteredLogsByTab().length > 0 ? (
              <Stack spacing={2}>
                {getFilteredLogsByTab().map((log) => (
                  <ABTestLogEntry key={log.id} log={log} />
                ))}
              </Stack>
            ) : (
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                No{" "}
                {selectedLogTab === 1
                  ? "traffic update"
                  : selectedLogTab === 2
                    ? "deactivation"
                    : ""}{" "}
                history available for {selectedAlgorithm}
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<IconHistory size={16} />}
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  // Refresh logs
                  if (selectedAlgorithm) {
                    const fetchLogs = async () => {
                      setLogsLoading(true);
                      const logs = await fetchAllLogs(selectedAlgorithm, 20); // Fetch more
                      setAbTestLogs(logs);
                      setLogsLoading(false);
                    };
                    fetchLogs();
                  }
                }}
              >
                Load More History
              </Button>
            </Box>
          </Box>
        </DashboardCard>
      </Box>
    </PageContainer>
  );
};

export default DeploymentsPage;
