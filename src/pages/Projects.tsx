import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Project, CreateProjectRequest } from '../types/api';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    domainId: '',
    enabled: true,
  });

  const projectsApi = useApi(apiService.getProjects.bind(apiService));
  const createProjectApi = useApi(apiService.createProject.bind(apiService));
  const deleteProjectApi = useApi(apiService.deleteProject.bind(apiService));
  const enableProjectApi = useApi(apiService.enableProject.bind(apiService));
  const disableProjectApi = useApi(apiService.disableProject.bind(apiService));

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectsApi.data) {
      setProjects(projectsApi.data);
    }
  }, [projectsApi.data]);

  const loadProjects = () => {
    projectsApi.execute();
  };

  const handleCreateProject = async () => {
    try {
      await createProjectApi.execute(formData);
      setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        domainId: '',
        enabled: true,
      });
      loadProjects();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create project', severity: 'error' });
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      await deleteProjectApi.execute(selectedProject.id);
      setSnackbar({ open: true, message: 'Project deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete project', severity: 'error' });
    }
  };

  const handleToggleProjectStatus = async (projectId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableProjectApi.execute(projectId);
        setSnackbar({ open: true, message: 'Project enabled successfully!', severity: 'success' });
      } else {
        await disableProjectApi.execute(projectId);
        setSnackbar({ open: true, message: 'Project disabled successfully!', severity: 'success' });
      }
      loadProjects();
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to ${enabled ? 'enable' : 'disable'} project`, severity: 'error' });
    }
  };

  const getStatusColor = (enabled: boolean | null) => {
    if (enabled === null) return 'default';
    return enabled ? 'success' : 'error';
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'description', headerName: 'Description', width: 300,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'enabled', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value ? 'Enabled' : 'Disabled'}
          color={getStatusColor(params?.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'domainId', headerName: 'Domain ID', width: 200,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'createdAt', headerName: 'Created', width: 180,
      valueFormatter: (params: any) => params?.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    { field: 'updatedAt', headerName: 'Updated', width: 180,
      valueFormatter: (params: any) => params?.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={params.row.enabled ? <VisibilityOffIcon /> : <VisibilityIcon />}
          label={params.row.enabled ? "Disable" : "Enable"}
          onClick={() => handleToggleProjectStatus(params.row.id, !params.row.enabled)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedProject(params.row);
            setOpenDeleteDialog(true);
          }}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Project
        </Button>
      </Box>

      {(projectsApi.loading || createProjectApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={projects}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={projectsApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Project Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter project description..."
            />

            <TextField
              label="Domain ID (Optional)"
              value={formData.domainId}
              onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
              fullWidth
              placeholder="Leave empty for default domain"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={createProjectApi.loading || !formData.name}
          >
            {createProjectApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete project "{selectedProject?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteProject}
            color="error"
            variant="contained"
            disabled={deleteProjectApi.loading}
          >
            {deleteProjectApi.loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 