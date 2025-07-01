import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";

type Props = {
  title?: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode | any;
  footer?: React.ReactNode;
  cardheading?: string | React.ReactNode;
  headtitle?: string | React.ReactNode;
  headsubtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  middlecontent?: string | React.ReactNode;
};

const DashboardCard = ({
  title,
  subtitle,
  description,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
}: Props) => {
  return (
    <Card
      sx={{ padding: 0, position: "relative" }}
      elevation={9}
      variant={undefined}
    >
      {/* Help tooltip in top-right corner */}
      {description && (
        <Tooltip
          title={description}
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
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              width: 20,
              height: 20,
              backgroundColor: "action.hover",
              fontSize: "12px",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            ?
          </IconButton>
        </Tooltip>
      )}

      {cardheading ? (
        <CardContent>
          <Typography variant="h5">{headtitle}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={{ p: "30px" }}>
          {title ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems={"center"}
              mb={3}
            >
              <Box>
                {title ? <Typography variant="h5">{title}</Typography> : ""}

                {subtitle ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    {subtitle}
                  </Typography>
                ) : (
                  ""
                )}
              </Box>
              {action}
            </Stack>
          ) : null}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
