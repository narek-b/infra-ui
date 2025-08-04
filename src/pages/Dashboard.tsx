import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Image as ImageIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';

interface DashboardStats {
  instances: number;
  volumes: number;
  networks: number;
  images: number;
  users: number;
  projects: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
  const theme = useTheme();
  
  const instancesApi = useApi(apiService.getInstances.bind(apiService));
  const volumesApi = useApi(apiService.getVolumes.bind(apiService));
  const networksApi = useApi(apiService.getNetworks.bind(apiService));
  const imagesApi = useApi(apiService.getImages.bind(apiService));
  const usersApi = useApi(apiService.getUsers.bind(apiService));
  const projectsApi = useApi(apiService.getProjects.bind(apiService));

  useEffect(() => {
    instancesApi.execute();
    volumesApi.execute();
    networksApi.execute();
    imagesApi.execute();
    usersApi.execute();
    projectsApi.execute();
  }, []);

  const stats: DashboardStats = {
    instances: instancesApi.data?.length || 0,
    volumes: volumesApi.data?.length || 0,
    networks: networksApi.data?.length || 0,
    images: imagesApi.data?.length || 0,
    users: usersApi.data?.length || 0,
    projects: projectsApi.data?.length || 0,
  };

  console.log('Dashboard - instancesApi.data:', instancesApi.data);
  console.log('Dashboard - stats.instances:', stats.instances);

  const chartData = [
    { name: 'Instances', value: stats.instances },
    { name: 'Volumes', value: stats.volumes },
    { name: 'Networks', value: stats.networks },
    { name: 'Images', value: stats.images },
    { name: 'Users', value: stats.users },
    { name: 'Projects', value: stats.projects },
  ];

  const statusData = [
    { name: 'Active', value: 75, color: '#4caf50' },
    { name: 'Inactive', value: 15, color: '#ff9800' },
    { name: 'Error', value: 10, color: '#f44336' },
  ];

  const StatCard = ({ title, value, icon, color, loading }: any) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {loading ? '...' : value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color + '20',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const isLoading = instancesApi.loading || volumesApi.loading || networksApi.loading || 
                   imagesApi.loading || usersApi.loading || projectsApi.loading;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Firebird Infrastructure Overview
      </Typography>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 3 }}>
        {/* Stats Cards */}
        <StatCard
          title="Instances"
          value={stats.instances}
          icon={<ComputerIcon />}
          color={theme.palette.primary.main}
          loading={instancesApi.loading}
        />
        <StatCard
          title="Volumes"
          value={stats.volumes}
          icon={<StorageIcon />}
          color="#4caf50"
          loading={volumesApi.loading}
        />
        <StatCard
          title="Networks"
          value={stats.networks}
          icon={<NetworkIcon />}
          color="#ff9800"
          loading={networksApi.loading}
        />
        <StatCard
          title="Images"
          value={stats.images}
          icon={<ImageIcon />}
          color="#9c27b0"
          loading={imagesApi.loading}
        />
        <StatCard
          title="Users"
          value={stats.users}
          icon={<ComputerIcon />}
          color="#2196f3"
          loading={usersApi.loading}
        />
        <StatCard
          title="Projects"
          value={stats.projects}
          icon={<ComputerIcon />}
          color="#607d8b"
          loading={projectsApi.loading}
        />
      </Box>

        {/* Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 3 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Resource Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mt: 3 }}>
              {statusData.map((item, index) => (
                <Box key={item.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: item.color + '20',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: item.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<TrendingUpIcon />}
                label="Instance 'web-server-01' started"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<TrendingDownIcon />}
                label="Volume 'data-vol-02' detached"
                color="warning"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUpIcon />}
                label="Network 'private-net' created"
                color="info"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUpIcon />}
                label="User 'john.doe' added to project"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Box>
    </Box>
  );
} 