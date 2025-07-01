type LogLevel = "error" | "warn" | "info" | "debug";

const getLogLevel = (): LogLevel => {
  const level = process.env.NEXT_PUBLIC_LOG_LEVEL || "info";
  return level as LogLevel;
};

const logger = {
  error: (message: string, ...args: any[]) =>
    console.error(`[API ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => {
    if (["warn", "info", "debug"].includes(getLogLevel())) {
      console.warn(`[API WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (["info", "debug"].includes(getLogLevel())) {
      console.info(`[API INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (getLogLevel() === "debug") {
      console.debug(`[API DEBUG] ${message}`, ...args);
    }
  },
};
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.warn(
      "NEXT_PUBLIC_API_BASE_URL is not defined, falling back to production URL",
    );
    return "https://smart-news-backend-production.up.railway.app";
  }

  return baseUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    ARTICLES: "/articles",
    METRICS_SUMMARY: "/metrics/summary",
    METRICS_BINS: "/metrics/bins",
    PREDICTORS: "/predictors",
    PREDICTOR_TYPES: "/predictors/types",
    PREDICTOR_VERSION: "/predictors/versions",
  },
} as const;

export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): string => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
  }

  return url.toString();
};

export const { BASE_URL, ENDPOINTS } = API_CONFIG;
