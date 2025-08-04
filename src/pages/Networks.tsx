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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Network, CreateNetworkRequest } from '../types/api';

export default function Networks() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateNetworkRequest>({
    name: '',
    adminStateUp: true,
    shared: false,
    tenantId: '',
  });

  const networksApi = useApi(apiService.getNetworks.bind(apiService));
  const createNetworkApi = useApi(apiService.createNetwork.bind(apiService));
  const deleteNetworkApi = useApi(apiService.deleteNetwork.bind(apiService));

  useEffect(() => {
    loadNetworks();
  }, []);

  useEffect(() => {
    if (networksApi.data) {
      setNetworks(networksApi.data);
    }
  }, [networksApi.data]);

  const loadNetworks = () => {
    networksApi.execute();
  };

  const handleCreateNetwork = async () => {
    try {
      await createNetworkApi.execute(formData);
      setSnackbar({ open: true, message: 'Network created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        adminStateUp: true,
        shared: false,
        tenantId: '',
      });
      loadNetworks();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create network', severity: 'error' });
    }
  };

  const handleDeleteNetwork = async () => {
    if (!selectedNetwork) return;
    try {
      await deleteNetworkApi.execute(selectedNetwork.id);
      setSnackbar({ open: true, message: 'Network deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedNetwork(null);
      loadNetworks();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete network', severity: 'error' });
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'down':
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
          color={getStatusColor(params?.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'adminStateUp', headerName: 'Admin State', width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value ? 'UP' : 'DOWN'}
          color={params?.value ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'shared', headerName: 'Shared', width: 100,
      renderCell: (params) => (
        <Chip
          label={params?.value ? 'Yes' : 'No'}
          color={params?.value ? 'info' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'tenantId', headerName: 'Tenant ID', width: 200,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'subnets', headerName: 'Subnets', width: 120,
      valueFormatter: (params: any) => {
        if (!params?.value || params.value.length === 0) return 'None';
        return `${params.value.length} subnet(s)`;
      }
    },
    { field: 'createdAt', headerName: 'Created', width: 180,
      valueFormatter: (params: any) => params?.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedNetwork(params.row);
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
          Networks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Network
        </Button>
      </Box>

      {(networksApi.loading || createNetworkApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={networks}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={networksApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Network Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Network</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Network Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Tenant ID (Optional)"
              value={formData.tenantId}
              onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              fullWidth
              placeholder="Leave empty for default tenant"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.adminStateUp}
                  onChange={(e) => setFormData({ ...formData, adminStateUp: e.target.checked })}
                />
              }
              label="Admin State Up"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.shared}
                  onChange={(e) => setFormData({ ...formData, shared: e.target.checked })}
                />
              }
              label="Shared Network"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNetwork}
            variant="contained"
            disabled={createNetworkApi.loading || !formData.name}
          >
            {createNetworkApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Network</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete network "{selectedNetwork?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteNetwork}
            color="error"
            variant="contained"
            disabled={deleteNetworkApi.loading}
          >
            {deleteNetworkApi.loading ? 'Deleting...' : 'Delete'}
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