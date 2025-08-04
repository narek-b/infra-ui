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
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Domain, CreateDomainRequest } from '../types/api';

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateDomainRequest>({
    name: '',
    description: '',
    enabled: true,
  });

  const domainsApi = useApi(apiService.getDomains.bind(apiService));
  const createDomainApi = useApi(apiService.createDomain.bind(apiService));
  const deleteDomainApi = useApi(apiService.deleteDomain.bind(apiService));

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    if (domainsApi.data) {
      setDomains(domainsApi.data);
    }
  }, [domainsApi.data]);

  const loadDomains = () => {
    domainsApi.execute();
  };

  const handleCreateDomain = async () => {
    try {
      await createDomainApi.execute(formData);
      setSnackbar({ open: true, message: 'Domain created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        enabled: true,
      });
      loadDomains();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create domain', severity: 'error' });
    }
  };

  const handleDeleteDomain = async () => {
    if (!selectedDomain) return;
    try {
      await deleteDomainApi.execute(selectedDomain.id);
      setSnackbar({ open: true, message: 'Domain deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedDomain(null);
      loadDomains();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete domain', severity: 'error' });
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
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedDomain(params.row);
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
          Domains
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Domain
        </Button>
      </Box>

      {(domainsApi.loading || createDomainApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={domains}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={domainsApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Domain Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Domain</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Domain Name"
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
              placeholder="Enter domain description..."
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
            onClick={handleCreateDomain}
            variant="contained"
            disabled={createDomainApi.loading || !formData.name}
          >
            {createDomainApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Domain</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete domain "{selectedDomain?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteDomain}
            color="error"
            variant="contained"
            disabled={deleteDomainApi.loading}
          >
            {deleteDomainApi.loading ? 'Deleting...' : 'Delete'}
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