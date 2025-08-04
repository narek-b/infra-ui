import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RebootIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Instance, CreateInstanceRequest, Image, Network } from '../types/api';

export default function Instances() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateInstanceRequest>({
    name: '',
    flavor: '',
    image: '',
    networkId: '',
  });

  // Available options for dropdowns
  const [availableImages, setAvailableImages] = useState<Image[]>([]);
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);
  const [availableFlavors] = useState([
    { id: 'm1.tiny', name: 'm1.tiny', vcpus: 1, ram: 512, disk: 1 },
    { id: 'm1.small', name: 'm1.small', vcpus: 1, ram: 2048, disk: 20 },
    { id: 'm1.medium', name: 'm1.medium', vcpus: 2, ram: 4096, disk: 40 },
    { id: 'm1.large', name: 'm1.large', vcpus: 4, ram: 8192, disk: 80 },
    { id: 'm1.xlarge', name: 'm1.xlarge', vcpus: 8, ram: 16384, disk: 160 },
  ]);

  const instancesApi = useApi(apiService.getInstances.bind(apiService));
  const createInstanceApi = useApi(apiService.createInstance.bind(apiService));
  const deleteInstanceApi = useApi(apiService.deleteInstance.bind(apiService));
  const startInstanceApi = useApi(apiService.startInstance.bind(apiService));
  const stopInstanceApi = useApi(apiService.stopInstance.bind(apiService));
  const rebootInstanceApi = useApi(apiService.rebootInstance.bind(apiService));
  
  // APIs for fetching options
  const imagesApi = useApi(apiService.getImages.bind(apiService));
  const networksApi = useApi(apiService.getNetworks.bind(apiService));

  useEffect(() => {
    loadInstances();
    loadOptions();
  }, []);

  useEffect(() => {
    console.log('Instances component - instancesApi.data:', instancesApi.data);
    if (instancesApi.data) {
      console.log('Setting instances:', instancesApi.data);
      setInstances(instancesApi.data);
    }
  }, [instancesApi.data]);

  useEffect(() => {
    if (imagesApi.data) {
      setAvailableImages(imagesApi.data);
    }
  }, [imagesApi.data]);

  useEffect(() => {
    if (networksApi.data) {
      setAvailableNetworks(networksApi.data);
    }
  }, [networksApi.data]);

  const loadInstances = () => {
    instancesApi.execute();
  };

  const loadOptions = () => {
    imagesApi.execute();
    networksApi.execute();
  };

  const handleCreateInstance = async () => {
    try {
      await createInstanceApi.execute(formData);
      setSnackbar({ open: true, message: 'Instance created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({ name: '', flavor: '', image: '', networkId: '' });
      loadInstances();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create instance', severity: 'error' });
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedInstance) return;
    try {
      await deleteInstanceApi.execute(selectedInstance.id);
      setSnackbar({ open: true, message: 'Instance deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedInstance(null);
      loadInstances();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete instance', severity: 'error' });
    }
  };

  const handleInstanceAction = async (action: 'start' | 'stop' | 'reboot', instanceId: string) => {
    try {
      switch (action) {
        case 'start':
          await startInstanceApi.execute(instanceId);
          break;
        case 'stop':
          await stopInstanceApi.execute(instanceId);
          break;
        case 'reboot':
          await rebootInstanceApi.execute(instanceId);
          break;
      }
      setSnackbar({ open: true, message: `Instance ${action}ed successfully!`, severity: 'success' });
      loadInstances();
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to ${action} instance`, severity: 'error' });
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'shutoff':
        return 'error';
      case 'building':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value || 'Unknown'}
          color={getStatusColor(params?.value || 'unknown')}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'flavor', headerName: 'Flavor', width: 150,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'image', headerName: 'Image', width: 150,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'privateIp', headerName: 'Private IP', width: 150,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'publicIp', headerName: 'Public IP', width: 150,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'createdAt', headerName: 'Created', width: 180,
      valueFormatter: (params: any) => params?.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<StartIcon />}
          label="Start"
          onClick={() => handleInstanceAction('start', params.row.id)}
          disabled={params.row.status === 'ACTIVE'}
        />,
        <GridActionsCellItem
          icon={<StopIcon />}
          label="Stop"
          onClick={() => handleInstanceAction('stop', params.row.id)}
          disabled={params.row.status === 'SHUTOFF'}
        />,
        <GridActionsCellItem
          icon={<RebootIcon />}
          label="Reboot"
          onClick={() => handleInstanceAction('reboot', params.row.id)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedInstance(params.row);
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
          Instances
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Instance
        </Button>
      </Box>

      {(instancesApi.loading || createInstanceApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={instances}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={instancesApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Instance Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Instance</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Instance Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <Autocomplete
              options={availableFlavors}
              getOptionLabel={(option) => `${option.name} (${option.vcpus} vCPU, ${option.ram}MB RAM, ${option.disk}GB)`}
              value={availableFlavors.find(f => f.id === formData.flavor) || null}
              onChange={(_, newValue) => setFormData({ ...formData, flavor: newValue?.id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Flavor"
                  required
                  placeholder="Search flavors..."
                />
              )}
              loading={false}
            />

            <Autocomplete
              options={availableImages}
              getOptionLabel={(option) => `${option.name} (${option.diskFormat}, ${option.size} bytes)`}
              value={availableImages.find(img => img.id === formData.image) || null}
              onChange={(_, newValue) => setFormData({ ...formData, image: newValue?.id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Image"
                  placeholder="Search images..."
                />
              )}
              loading={imagesApi.loading}
            />

            <Autocomplete
              options={availableNetworks}
              getOptionLabel={(option) => `${option.name} (${option.status})`}
              value={availableNetworks.find(net => net.id === formData.networkId) || null}
              onChange={(_, newValue) => setFormData({ ...formData, networkId: newValue?.id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Network"
                  placeholder="Search networks..."
                />
              )}
              loading={networksApi.loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateInstance}
            variant="contained"
            disabled={createInstanceApi.loading || !formData.name || !formData.flavor}
          >
            {createInstanceApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Instance</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete instance "{selectedInstance?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteInstance}
            color="error"
            variant="contained"
            disabled={deleteInstanceApi.loading}
          >
            {deleteInstanceApi.loading ? 'Deleting...' : 'Delete'}
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