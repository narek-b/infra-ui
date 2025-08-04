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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as AttachIcon,
  LinkOff as DetachIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Volume, CreateVolumeRequest, Instance } from '../types/api';

export default function Volumes() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAttachDialog, setOpenAttachDialog] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateVolumeRequest>({
    name: '',
    size: 1,
    volumeType: 'lvmdriver-1',
    availabilityZone: 'nova',
  });
  const [attachData, setAttachData] = useState({
    instanceId: '',
    device: '/dev/vdb',
  });

  const volumesApi = useApi(apiService.getVolumes.bind(apiService));
  const instancesApi = useApi(apiService.getInstances.bind(apiService));
  const createVolumeApi = useApi(apiService.createVolume.bind(apiService));
  const deleteVolumeApi = useApi(apiService.deleteVolume.bind(apiService));
  const attachVolumeApi = useApi(apiService.attachVolume.bind(apiService));
  const detachVolumeApi = useApi(apiService.detachVolume.bind(apiService));

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (volumesApi.data) {
      setVolumes(volumesApi.data);
    }
  }, [volumesApi.data]);

  useEffect(() => {
    if (instancesApi.data) {
      setInstances(instancesApi.data);
    }
  }, [instancesApi.data]);

  const loadData = () => {
    volumesApi.execute();
    instancesApi.execute();
  };

  const handleCreateVolume = async () => {
    try {
      await createVolumeApi.execute(formData);
      setSnackbar({ open: true, message: 'Volume created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        size: 1,
        volumeType: 'lvmdriver-1',
        availabilityZone: 'nova',
      });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create volume', severity: 'error' });
    }
  };

  const handleDeleteVolume = async () => {
    if (!selectedVolume) return;
    try {
      await deleteVolumeApi.execute(selectedVolume.id);
      setSnackbar({ open: true, message: 'Volume deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedVolume(null);
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete volume', severity: 'error' });
    }
  };

  const handleAttachVolume = async () => {
    if (!selectedVolume) return;
    try {
      await attachVolumeApi.execute(selectedVolume.id, attachData.instanceId, attachData.device);
      setSnackbar({ open: true, message: 'Volume attached successfully!', severity: 'success' });
      setOpenAttachDialog(false);
      setSelectedVolume(null);
      setAttachData({ instanceId: '', device: '/dev/vdb' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to attach volume', severity: 'error' });
    }
  };

  const handleDetachVolume = async (volumeId: string) => {
    try {
      await detachVolumeApi.execute(volumeId);
      setSnackbar({ open: true, message: 'Volume detached successfully!', severity: 'success' });
      loadData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to detach volume', severity: 'error' });
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'in-use':
        return 'info';
      case 'creating':
        return 'warning';
      case 'deleting':
        return 'error';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFileSize = (gb: number) => {
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${gb} GB`;
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value || 'Unknown'}
          color={getStatusColor(params?.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'size', headerName: 'Size', width: 100,
      valueFormatter: (params: any) => params?.value ? formatFileSize(params.value) : 'N/A'
    },
    { field: 'volumeType', headerName: 'Type', width: 120,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'availabilityZone', headerName: 'Availability Zone', width: 150,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'attachments', headerName: 'Attachments', width: 120,
      valueFormatter: (params: any) => {
        if (!params?.value || params.value.length === 0) return 'None';
        return `${params.value.length} instance(s)`;
      }
    },
    { field: 'createdAt', headerName: 'Created', width: 180,
      valueFormatter: (params: any) => params?.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => {
        const isAttached = params.row.attachments && params.row.attachments.length > 0;
        return [
          <GridActionsCellItem
            icon={isAttached ? <DetachIcon /> : <AttachIcon />}
            label={isAttached ? "Detach" : "Attach"}
            onClick={() => {
              if (isAttached) {
                handleDetachVolume(params.row.id);
              } else {
                setSelectedVolume(params.row);
                setOpenAttachDialog(true);
              }
            }}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              setSelectedVolume(params.row);
              setOpenDeleteDialog(true);
            }}
          />,
        ];
      },
    },
  ];

  const volumeTypes = ['lvmdriver-1', 'ceph', 'nfs', 'iscsi'];
  const availabilityZones = ['nova', 'compute', 'storage'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Volumes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Volume
        </Button>
      </Box>

      {(volumesApi.loading || createVolumeApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={volumes}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={volumesApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Volume Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Volume</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Volume Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Size (GB)"
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 1 })}
              fullWidth
              required
              inputProps={{ min: 1, max: 10000 }}
            />

            <Autocomplete
              options={volumeTypes}
              value={formData.volumeType}
              onChange={(_, newValue) => setFormData({ ...formData, volumeType: newValue || 'lvmdriver-1' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Volume Type"
                  placeholder="Select volume type..."
                />
              )}
            />

            <Autocomplete
              options={availabilityZones}
              value={formData.availabilityZone}
              onChange={(_, newValue) => setFormData({ ...formData, availabilityZone: newValue || 'nova' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Availability Zone"
                  placeholder="Select availability zone..."
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateVolume}
            variant="contained"
            disabled={createVolumeApi.loading || !formData.name || formData.size < 1}
          >
            {createVolumeApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attach Volume Dialog */}
      <Dialog open={openAttachDialog} onClose={() => setOpenAttachDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Attach Volume</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Attaching volume: {selectedVolume?.name}
            </Typography>
            
            <Autocomplete
              options={instances}
              getOptionLabel={(option) => `${option.name} (${option.id})`}
              value={instances.find(inst => inst.id === attachData.instanceId) || null}
              onChange={(_, newValue) => setAttachData({ ...attachData, instanceId: newValue?.id || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Instance"
                  required
                  placeholder="Select instance..."
                />
              )}
            />

            <TextField
              label="Device Path"
              value={attachData.device}
              onChange={(e) => setAttachData({ ...attachData, device: e.target.value })}
              fullWidth
              required
              placeholder="/dev/vdb"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttachDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAttachVolume}
            variant="contained"
            disabled={attachVolumeApi.loading || !attachData.instanceId || !attachData.device}
          >
            {attachVolumeApi.loading ? 'Attaching...' : 'Attach'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Volume</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete volume "{selectedVolume?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteVolume}
            color="error"
            variant="contained"
            disabled={deleteVolumeApi.loading}
          >
            {deleteVolumeApi.loading ? 'Deleting...' : 'Delete'}
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