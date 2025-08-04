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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Role, CreateRoleRequest } from '../types/api';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
  });

  const rolesApi = useApi(apiService.getRoles.bind(apiService));
  const createRoleApi = useApi(apiService.createRole.bind(apiService));
  const deleteRoleApi = useApi(apiService.deleteRole.bind(apiService));

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (rolesApi.data) {
      setRoles(rolesApi.data);
    }
  }, [rolesApi.data]);

  const loadRoles = () => {
    rolesApi.execute();
  };

  const handleCreateRole = async () => {
    try {
      await createRoleApi.execute(formData);
      setSnackbar({ open: true, message: 'Role created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        description: '',
      });
      loadRoles();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create role', severity: 'error' });
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await deleteRoleApi.execute(selectedRole.id);
      setSnackbar({ open: true, message: 'Role deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete role', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'description', headerName: 'Description', width: 400,
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
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedRole(params.row);
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
          Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Role
        </Button>
      </Box>

      {(rolesApi.loading || createRoleApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={roles}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={rolesApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Role Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Role Name"
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
              placeholder="Enter role description..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            disabled={createRoleApi.loading || !formData.name}
          >
            {createRoleApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete role "{selectedRole?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteRole}
            color="error"
            variant="contained"
            disabled={deleteRoleApi.loading}
          >
            {deleteRoleApi.loading ? 'Deleting...' : 'Delete'}
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