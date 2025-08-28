import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useVms } from '../hooks/useVms';
import { apiService } from '../services/api';
import { VmCreateRequest, VmResponse } from '../types/api';

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Running':
      return 'success';
    case 'Stopped':
      return 'default';
    case 'Pending':
      return 'warning';
    case 'Error':
      return 'error';
    default:
      return 'default';
  }
};

// CPU and Memory options
const cpuOptions = [1, 2, 4, 8, 16, 32];
const memoryOptions = [1, 2, 4, 8, 16, 32, 64, 128];

export default function Compute() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vmToDelete, setVmToDelete] = useState<{ name: string; namespace: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Create New VM dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
                const [vmForm, setVmForm] = useState<Partial<VmCreateRequest>>({
      name: '',
      namespace: 'narek',
      cpuCores: 2,
      memoryGb: 4,
      image: 'kubevirt/cirros-container-disk-demo:latest',
      description: '',
      password: '',
      enablePublicIp: true,
    });

    // Password confirmation state
    const [passwordConfirm, setPasswordConfirm] = useState('');

  // View VM details dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVm, setSelectedVm] = useState<VmResponse | null>(null);
  const [loadingVmDetails, setLoadingVmDetails] = useState(false);

  // Error handling state
  const [errorSnackbar, setErrorSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'error' | 'success';
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  // Use the custom hook to fetch VM data
  const { vms, loading, error, pagination, stats, fetchVms, refreshVms } = useVms({
    namespace: 'narek',
    pageSize: rowsPerPage,
  });

  // Refresh loading state
  const [refreshing, setRefreshing] = useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchVms(newPage + 1); // API uses 1-based pagination
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchVms(1); // Reset to first page
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshVms();
    } catch (error) {
      console.error('Error refreshing VMs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh VMs';
      showError(`Failed to refresh VMs: ${errorMessage}`);
    } finally {
      setRefreshing(false);
    }
  };

  const showError = (message: string) => {
    setErrorSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  };

  const showSuccess = (message: string) => {
    setErrorSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setErrorSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDeleteClick = (vm: { name: string; namespace: string }) => {
    setVmToDelete(vm);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vmToDelete) return;
    
    try {
      setDeleting(true);
      await apiService.deleteVm(vmToDelete.namespace, vmToDelete.name);
      setDeleteDialogOpen(false);
      setVmToDelete(null);
      showSuccess(`VM "${vmToDelete.name}" deleted successfully`);
      refreshVms(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting VM:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete VM';
      showError(`Failed to delete VM "${vmToDelete.name}": ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVmToDelete(null);
  };

  // View VM details handlers
  const handleViewClick = async (vm: VmResponse) => {
    try {
      setLoadingVmDetails(true);
      const vmDetails = await apiService.getVm(vm.namespace, vm.name);
      setSelectedVm(vmDetails);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching VM details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch VM details';
      showError(`Failed to fetch VM details: ${errorMessage}`);
    } finally {
      setLoadingVmDetails(false);
    }
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setSelectedVm(null);
  };

  // Create New VM handlers
  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateCancel = () => {
    setCreateDialogOpen(false);
    setVmForm({
      name: '',
      namespace: 'narek',
      cpuCores: 2,
      memoryGb: 4,
      image: 'kubevirt/cirros-container-disk-demo:latest',
      description: '',
      password: '',
      enablePublicIp: true,
    });
    setPasswordConfirm('');
  };

  const handleCreateConfirm = async () => {
    if (!vmForm.name || !vmForm.cpuCores || !vmForm.memoryGb) {
      showError('Please fill in all required fields');
      return; // Form validation
    }

    // Password validation
    if (vmForm.password && vmForm.password !== passwordConfirm) {
      showError('Passwords do not match');
      return;
    }

    if (vmForm.password && vmForm.password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    try {
      setCreating(true);
      await apiService.createVm(vmForm as VmCreateRequest);
      setCreateDialogOpen(false);
      setVmForm({
        name: '',
        namespace: 'narek',
        cpuCores: 2,
        memoryGb: 4,
        image: 'kubevirt/cirros-container-disk-demo:latest',
        description: '',
        password: '',
        enablePublicIp: true,
      });
      setPasswordConfirm('');
      showSuccess(`VM "${vmForm.name}" created successfully`);
      refreshVms(); // Refresh the list after creation
    } catch (error) {
      console.error('Error creating VM:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create VM';
      showError(`Failed to create VM "${vmForm.name}": ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleFormChange = (field: keyof VmCreateRequest, value: any) => {
    setVmForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      p: { xs: 2, sm: 3, md: 4 },
      pt: { xs: 5, sm: 3, md: 4 },
    }}>
      {/* Header with Create New button and stats */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: { xs: 1, sm: 0 }
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '18px', sm: '20px', md: '24px' },
              lineHeight: { xs: '22px', sm: '24px', md: '28px' },
              letterSpacing: '-0.03em',
              color: '#000000',
              mb: 1,
            }}
          >
            Compute
          </Typography>
          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`${stats.runningCount} Running`} 
              color="success" 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`${stats.stoppedCount} Stopped`} 
              color="default" 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`${stats.pendingCount} Pending`} 
              color="warning" 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`${stats.errorCount} Error`} 
              color="error" 
              size="small" 
              variant="outlined"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || refreshing}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '13px', sm: '14px' },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: '8px',
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{
              backgroundColor: '#B99F6F',
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '13px', sm: '14px' },
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1, sm: 1.25 },
              borderRadius: '8px',
              minWidth: { xs: 'auto', sm: 'auto' },
              '&:hover': {
                backgroundColor: '#A8905F',
              },
            }}
          >
            Create New
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table Container */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          flex: 1,
          width: '100%',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: 'white',
          overflow: 'auto',
          borderRadius: '8px',
        }}
      >
        <Table sx={{ minWidth: { xs: 300, sm: 600 } }}>
          <TableHead>
            <TableRow sx={{ height: { xs: 48, sm: 56 }, backgroundColor: '#F8F9F9' }}>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                Name
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                Status
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                CPU
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                Memory
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                Private IP
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                Public IP
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' }
              }}>
                Age
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600,
                fontSize: { xs: '13px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '18px' },
                color: '#000000',
                borderBottom: '1px solid #E5E7EB',
                padding: { xs: '12px 16px', sm: '16px 20px' },
                width: 120,
              }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ mt: 1, color: '#666' }}>
                    Loading VMs...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : vms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: '#666' }}>
                    No VMs found in namespace 'narek'
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vms.map((vm) => (
                <TableRow key={`${vm.namespace}-${vm.name}`} sx={{ height: { xs: 32, sm: 40 } }}>
                  <TableCell sx={{ 
                    color: '#181818',
                    fontSize: { xs: '13px', sm: '14px' },
                    lineHeight: { xs: '16px', sm: '18px' },
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' },
                    fontWeight: 500,
                  }}>
                    {vm.name}
                  </TableCell>
                  <TableCell sx={{ 
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' }
                  }}>
                    <Chip 
                      label={vm.status} 
                      color={getStatusColor(vm.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#181818',
                    fontSize: { xs: '13px', sm: '14px' },
                    lineHeight: { xs: '16px', sm: '18px' },
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' }
                  }}>
                    {vm.cpuCores} vCPU
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#181818',
                    fontSize: { xs: '13px', sm: '14px' },
                    lineHeight: { xs: '16px', sm: '18px' },
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' }
                  }}>
                    {vm.memory}
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#181818',
                    fontSize: { xs: '13px', sm: '14px' },
                    lineHeight: { xs: '16px', sm: '18px' },
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' }
                  }}>
                    {vm.ipAddress || '-'}
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#181818',
                    fontSize: { xs: '13px', sm: '14px' },
                    lineHeight: { xs: '16px', sm: '18px' },
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' }
                  }}>
                    {vm.publicIpAddress || '-'}
                  </TableCell>
                  <TableCell sx={{ 
                    color: '#181818',
                    fontSize: { xs: '13px', sm: '14px' },
                    lineHeight: { xs: '16px', sm: '18px' },
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '8px 16px', sm: '12px 20px' }
                  }}>
                    {(() => {
                      // Parse UTC timestamp from server and convert to local timezone
                      const created = new Date(vm.createdAt + 'Z'); // Ensure UTC parsing
                      const now = new Date();
                      const diffInMs = now.getTime() - created.getTime();
                      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
                      
                      if (diffInDays > 0) {
                        return `${diffInDays}d`;
                      } else if (diffInHours > 0) {
                        return `${diffInHours}h`;
                      } else if (diffInMinutes > 0) {
                        return `${diffInMinutes}m`;
                      } else {
                        return 'now';
                      }
                    })()}
                  </TableCell>
                  <TableCell sx={{ 
                    borderBottom: '1px solid #E5E7EB',
                    padding: { xs: '4px 8px', sm: '8px 12px' },
                    textAlign: 'center',
                  }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View VM Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewClick(vm)}
                          disabled={loadingVmDetails}
                          sx={{
                            color: '#6B7280',
                            '&:hover': {
                              backgroundColor: 'rgba(107, 114, 128, 0.1)',
                              color: '#374151',
                            },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete VM">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick({ name: vm.name, namespace: vm.namespace })}
                          sx={{
                            color: '#dc3545',
                            '&:hover': {
                              backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={pagination.totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* View VM Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: '20px',
          borderBottom: '1px solid #E5E7EB',
          pb: 2,
        }}>
          VM Details: {selectedVm?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedVm ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.name}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Namespace
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.namespace}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip 
                      label={selectedVm.status} 
                      color={getStatusColor(selectedVm.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Phase
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.phase}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Resource Configuration */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Resource Configuration
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      CPU Cores
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.cpuCores} vCPU{selectedVm.cpuCores > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Memory
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.memory}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                    Image
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                    {selectedVm.image}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Network Information */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Network Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      IP Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.ipAddress || 'Not assigned'}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Node Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedVm.nodeName || 'Not assigned'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Timestamps */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Timestamps
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Created
                    </Typography>
                                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedVm.createdAt + 'Z').toLocaleString()}
                      </Typography>
                  </Box>
                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      Last Updated
                    </Typography>
                                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedVm.updatedAt + 'Z').toLocaleString()}
                      </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Description */}
              {selectedVm.description && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {selectedVm.description}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={handleViewClose}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: '8px',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create New VM Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: '20px',
          borderBottom: '1px solid #E5E7EB',
          pb: 2,
        }}>
          Create New Virtual Machine
        </DialogTitle>
                  <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* VM Name */}
              <TextField
                label="Virtual Machine Name"
                value={vmForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                fullWidth
                required
                placeholder="Enter VM name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />

              {/* CPU Cores */}
              <FormControl fullWidth>
                <InputLabel>CPU Cores</InputLabel>
                <Select
                  value={vmForm.cpuCores}
                  label="CPU Cores"
                  onChange={(e) => handleFormChange('cpuCores', e.target.value)}
                  sx={{
                    borderRadius: '8px',
                  }}
                >
                  {cpuOptions.map((cpu) => (
                    <MenuItem key={cpu} value={cpu}>
                      {cpu} vCPU{cpu > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Memory */}
              <FormControl fullWidth>
                <InputLabel>Memory</InputLabel>
                <Select
                  value={vmForm.memoryGb}
                  label="Memory"
                  onChange={(e) => handleFormChange('memoryGb', e.target.value)}
                  sx={{
                    borderRadius: '8px',
                  }}
                >
                  {memoryOptions.map((memory) => (
                    <MenuItem key={memory} value={memory}>
                      {memory} GB
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Password */}
              <TextField
                label="Password (Optional)"
                type="password"
                value={vmForm.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                fullWidth
                placeholder="Enter password for VM user account"
                helperText="Minimum 6 characters if provided"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />

              {/* Password Confirmation */}
              {vmForm.password && (
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  fullWidth
                  required
                  placeholder="Re-enter password"
                  error={passwordConfirm !== '' && vmForm.password !== passwordConfirm}
                  helperText={passwordConfirm !== '' && vmForm.password !== passwordConfirm ? 'Passwords do not match' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              )}

              {/* Enable Public IP */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={vmForm.enablePublicIp}
                    onChange={(e) => handleFormChange('enablePublicIp', e.target.checked)}
                    sx={{
                      '&.Mui-checked': {
                        color: '#B99F6F',
                      },
                    }}
                  />
                }
                label="Enable Public IP Address"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '14px',
                    color: '#374151',
                  },
                }}
              />

              {/* Description */}
              <TextField
                label="Description (Optional)"
                value={vmForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Enter a description for this VM"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Box>
          </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid #E5E7EB' }}>
          <Button
            onClick={handleCreateCancel}
            disabled={creating}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: '8px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConfirm}
            disabled={creating || !vmForm.name}
            variant="contained"
            sx={{
              backgroundColor: '#B99F6F',
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#A8905F',
              },
              '&:disabled': {
                backgroundColor: '#E5E7EB',
                color: '#9CA3AF',
              },
            }}
          >
            {creating ? 'Creating...' : 'Create VM'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Virtual Machine
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the virtual machine "{vmToDelete?.name}"? 
            This action cannot be undone and will permanently remove the VM from the cluster.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error/Success Snackbar */}
      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={errorSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
