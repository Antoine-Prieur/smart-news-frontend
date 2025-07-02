"use client";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Grid,
  Divider,
  Stack,
} from "@mui/material";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconBrandTwitter,
  IconWorld,
} from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

const AboutPage = () => {
  const skills = [
    "Python",
    "FastAPI",
    "Apache Spark",
    "Kafka",
    "Machine Learning",
    "Deep Learning",
    "PyTorch",
    "AWS",
    "Kubernetes",
    "Docker",
    "MongoDB",
    "PostgreSQL",
    "GitLab CI/CD",
    "Terraform",
    "NLP",
    "Computer Vision",
    "ETL Pipelines",
    "Microservices",
  ];

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Antoine-Prieur",
      icon: IconBrandGithub,
      color: "#333",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/antoine-prieur-22458a170",
      icon: IconBrandLinkedin,
      color: "#0077B5",
    },
    {
      name: "Email",
      url: "mailto:antoine.prieur45@gmail.com",
      icon: IconMail,
      color: "#EA4335",
    },
    {
      name: "Portfolio",
      url: "https://smart-news-frontend.vercel.app/",
      icon: IconWorld,
      color: "#4285F4",
    },
  ];

  return (
    <PageContainer
      title="About Me"
      description="Learn more about my background and skills"
    >
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid xs={12} md={4}>
          <DashboardCard>
            <CardContent>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
              >
                <Avatar
                  src="/images/profile/antoine-prieur.jpg"
                  alt="Antoine Prieur"
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: "4px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Typography variant="h4" fontWeight="600" mb={1}>
                  Antoine Prieur
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  mb={2}
                  fontWeight="400"
                >
                  Machine Learning Engineer & ML Platform Architect
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  📍 Orléans, France
                </Typography>

                {/* Social Links */}
                <Stack direction="row" spacing={1} justifyContent="center">
                  {socialLinks.map((social) => (
                    <IconButton
                      key={social.name}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: social.color,
                        "&:hover": {
                          backgroundColor: `${social.color}15`,
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                      aria-label={social.name}
                    >
                      <social.icon size="1.5rem" />
                    </IconButton>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Main Content */}
        <Grid xs={12} md={8}>
          <Stack spacing={3}>
            {/* About Section */}
            <DashboardCard>
              <CardContent>
                <Typography variant="h5" fontWeight="600" mb={2}>
                  About Me
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  lineHeight={1.7}
                >
                  I'm a Machine Learning Engineer & ML Platform Architect who
                  loves to actually deploy ML. My passion lies in bridging the
                  gap between ML research and production systems, with 3+ years
                  of experience specializing in data-intensive systems and ML
                  infrastructure.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  lineHeight={1.7}
                  mt={2}
                >
                  I have a strong track record of architecting and implementing
                  scalable data pipelines and distributed systems using Apache
                  Spark, Kafka, and cloud technologies. I focus on building
                  robust ML deployment workflows, real-time data processing
                  solutions, and production-grade monitoring systems that serve
                  business-critical applications.
                </Typography>
              </CardContent>
            </DashboardCard>

            {/* Technical Skills */}
            <DashboardCard>
              <CardContent>
                <Typography variant="h5" fontWeight="600" mb={3}>
                  Technical Skills
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </DashboardCard>

            {/* Current Project */}
            <DashboardCard>
              <CardContent>
                <Typography variant="h5" fontWeight="600" mb={2}>
                  Current Project
                </Typography>
                <Typography variant="h6" color="primary.main" mb={1}>
                  Mood-Aware News Platform
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  lineHeight={1.7}
                >
                  I'm building a news platform with ML capabilities that lets
                  you consume news without killing your mood. Features sentiment
                  analysis to filter articles by emotional tone, with upcoming
                  positivity filters and theme-based filtering.
                </Typography>
                <Box mt={2}>
                  <Chip label="Python" size="small" sx={{ mr: 1 }} />
                  <Chip label="Rust" size="small" sx={{ mr: 1 }} />
                  <Chip
                    label="Sentiment Analysis"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip label="MongoDB" size="small" sx={{ mr: 1 }} />
                  <Chip label="Redis" size="small" sx={{ mr: 1 }} />
                  <Chip label="A/B testing" size="small" sx={{ mr: 1 }} />
                </Box>
              </CardContent>
            </DashboardCard>
          </Stack>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AboutPage;
