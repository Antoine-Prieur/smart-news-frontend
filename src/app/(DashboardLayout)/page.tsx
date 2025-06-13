'use client'
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';

const Dashboard = () => {
  return (
    <PageContainer title="News" description="Latest news and updates">
      <Blog />
    </PageContainer>
  );
}

export default Dashboard;
