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
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';
import { Image, CreateImageRequest } from '../types/api';

export default function Images() {
  const [images, setImages] = useState<Image[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [formData, setFormData] = useState<CreateImageRequest>({
    name: '',
    diskFormat: '',
    containerFormat: '',
    visibility: 'private',
    minDisk: 0,
    minRam: 0,
  });

  const imagesApi = useApi(apiService.getImages.bind(apiService));
  const createImageApi = useApi(apiService.createImage.bind(apiService));
  const deleteImageApi = useApi(apiService.deleteImage.bind(apiService));

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (imagesApi.data) {
      setImages(imagesApi.data);
    }
  }, [imagesApi.data]);

  const loadImages = () => {
    imagesApi.execute();
  };

  const handleCreateImage = async () => {
    try {
      await createImageApi.execute(formData);
      setSnackbar({ open: true, message: 'Image created successfully!', severity: 'success' });
      setOpenCreateDialog(false);
      setFormData({
        name: '',
        diskFormat: '',
        containerFormat: '',
        visibility: 'private',
        minDisk: 0,
        minRam: 0,
      });
      loadImages();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create image', severity: 'error' });
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    try {
      await deleteImageApi.execute(selectedImage.id);
      setSnackbar({ open: true, message: 'Image deleted successfully!', severity: 'success' });
      setOpenDeleteDialog(false);
      setSelectedImage(null);
      loadImages();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete image', severity: 'error' });
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'queued':
        return 'warning';
      case 'saving':
        return 'info';
      case 'killed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVisibilityColor = (visibility: string | null) => {
    if (!visibility) return 'default';
    switch (visibility.toLowerCase()) {
      case 'public':
        return 'success';
      case 'private':
        return 'default';
      case 'shared':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    { field: 'visibility', headerName: 'Visibility', width: 120,
      renderCell: (params) => (
        <Chip
          label={params?.value || 'Unknown'}
          color={getVisibilityColor(params?.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'diskFormat', headerName: 'Disk Format', width: 120,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'containerFormat', headerName: 'Container Format', width: 140,
      valueFormatter: (params: any) => params?.value || 'N/A'
    },
    { field: 'size', headerName: 'Size', width: 120,
      valueFormatter: (params: any) => params?.value ? formatFileSize(params.value) : 'N/A'
    },
    { field: 'minDisk', headerName: 'Min Disk (GB)', width: 130,
      valueFormatter: (params: any) => params?.value || '0'
    },
    { field: 'minRam', headerName: 'Min RAM (MB)', width: 130,
      valueFormatter: (params: any) => params?.value || '0'
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
            setSelectedImage(params.row);
            setOpenDeleteDialog(true);
          }}
        />,
      ],
    },
  ];

  const diskFormats = ['raw', 'qcow2', 'vhd', 'vmdk', 'vdi', 'iso', 'aki', 'ari', 'ami'];
  const containerFormats = ['bare', 'ovf', 'ova', 'aki', 'ari', 'ami'];
  const visibilityOptions = ['public', 'private', 'shared'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Images
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Image
        </Button>
      </Box>

      {(imagesApi.loading || createImageApi.loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={images}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          loading={imagesApi.loading}
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Create Image Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Image</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Image Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            
            <Autocomplete
              options={diskFormats}
              value={formData.diskFormat}
              onChange={(_, newValue) => setFormData({ ...formData, diskFormat: newValue || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Disk Format"
                  required
                  placeholder="Select disk format..."
                />
              )}
            />

            <Autocomplete
              options={containerFormats}
              value={formData.containerFormat}
              onChange={(_, newValue) => setFormData({ ...formData, containerFormat: newValue || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Container Format"
                  placeholder="Select container format..."
                />
              )}
            />

            <Autocomplete
              options={visibilityOptions}
              value={formData.visibility}
              onChange={(_, newValue) => setFormData({ ...formData, visibility: newValue || 'private' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Visibility"
                  placeholder="Select visibility..."
                />
              )}
            />

            <TextField
              label="Minimum Disk (GB)"
              type="number"
              value={formData.minDisk}
              onChange={(e) => setFormData({ ...formData, minDisk: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Minimum RAM (MB)"
              type="number"
              value={formData.minRam}
              onChange={(e) => setFormData({ ...formData, minRam: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateImage}
            variant="contained"
            disabled={createImageApi.loading || !formData.name || !formData.diskFormat}
          >
            {createImageApi.loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Image</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete image "{selectedImage?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteImage}
            color="error"
            variant="contained"
            disabled={deleteImageApi.loading}
          >
            {deleteImageApi.loading ? 'Deleting...' : 'Delete'}
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