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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { User, CreateUserRequest } from '../types/api';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    domainId: '',
    enabled: true,
  });

  const usersApi = useApi(apiService.getUsers.bind(apiService));
  const createUserApi = useApi(apiService.createUser.bind(apiService));
  const deleteUserApi = useApi(apiService.deleteUser.bind(apiService));
  const enableUserApi = useApi(apiService.enableUser.bind(apiService));
  const disableUserApi = useApi(apiService.disableUser.bind(apiService));

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (usersApi.data) {
      setUsers(usersApi.data);
    }
  }, [usersApi.data]);

  const loadUsers = () => {
    usersApi.execute();
  };

  const handleCreateUser = async () => {
    try {
      await createUserApi.execute(formData);
      setSnackbar({ open: true, message: 'User created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        domainId: '',
        enabled: true,
      });
      loadUsers();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create user', severity: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUserApi.execute(selectedUser.id);
      setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  const handleToggleUserStatus = async (userId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableUserApi.execute(userId);
        setSnackbar({ open: true, message: 'User enabled successfully!', severity: 'success' });
      } else {
        await disableUserApi.execute(userId);
        setSnackbar({ open: true, message: 'User disabled successfully!', severity: 'success' });
      }
      loadUsers();
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to ${enabled ? 'enable' : 'disable'} user`, severity: 'error' });
    }
  };

  const getStatusColor = (enabled: boolean | null) => {
    if (enabled === null) return 'default';
    return enabled ? 'success' : 'error';
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'email', headerName: 'Email', width: 250,
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
          onClick={() => handleToggleUserStatus(params.row.id, !params.row.enabled)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setSelectedUser(params.row);
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
          Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create User
        </Button>
      </Box>

      {(usersApi.loading || createUserApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={usersApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Username"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required
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
            onClick={handleCreateUser}
            variant="contained"
            disabled={createUserApi.loading || !formData.name || !formData.email || !formData.password}
          >
            {createUserApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={deleteUserApi.loading}
          >
            {deleteUserApi.loading ? 'Deleting...' : 'Delete'}
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