# Firebird Infrastructure UI

A modern, responsive React.js web application for managing infrastructure through the infra-service abstraction API. This application provides a beautiful and intuitive user interface for managing instances, volumes, networks, images, users, projects, and more—regardless of the underlying cloud provider.

## Features

- 🎨 **Modern UI/UX**: Built with Material-UI for a clean, professional look
- 📊 **Real-time Dashboard**: Overview of all infrastructure resources with charts and statistics
- 🖥️ **Instance Management**: Create, start, stop, reboot, and delete instances
- 💾 **Volume Management**: Manage storage volumes and attachments
- 🌐 **Network Management**: Configure networks and subnets
- 🖼️ **Image Management**: Handle system images and snapshots
- 👥 **Identity Management**: User and domain administration
- 🏢 **Tenant Management**: Project and role management
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates**: Live status updates and notifications
- 🔄 **API Integration**: Full integration with the infra-service backend

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Data Grid**: MUI X Data Grid
- **State Management**: React Hooks
- **Build Tool**: Create React App

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Running infra-service backend (see [infra-service README](../infra-service/README.md))

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd /path/to/your/project
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm start
   ```
4. **Open your browser** and navigate to `http://localhost:3000`

## Configuration

The application is configured to connect to the infra-service backend running on `http://localhost:8080`. If your backend is running on a different URL, update the `baseURL` in `src/services/api.ts`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   └── Instances.tsx   # Instance management
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── hooks/              # Custom React hooks
│   └── useApi.ts      # API state management hook
├── types/              # TypeScript type definitions
│   └── api.ts         # API response types
└── utils/              # Utility functions
```

## API Integration

The application integrates with the infra-service backend API, providing access to:

### Infrastructure Management
- **Instances**: Create, list, start, stop, reboot, delete
- **Volumes**: Create, list, attach, detach, delete
- **Networks**: Create, list, configure, delete
- **Images**: Create, list, manage, delete

### Identity Management
- **Users**: Create, list, update, enable/disable, delete
- **Domains**: List and manage domains

### Tenant Management
- **Projects**: Create, list, update, enable/disable, delete
- **Roles**: List and manage roles

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Add navigation item to `src/components/Layout.tsx`

### Adding New API Endpoints

1. Add the method to `src/services/api.ts`
2. Create corresponding TypeScript types in `src/types/api.ts`
3. Use the `useApi` hook in your component

### Styling

The application uses Material-UI theming. Customize the theme in `src/App.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
  },
  // ... other theme options
});
```

## Deployment

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```
2. **Serve the build folder** using any static file server:
   ```bash
   npx serve -s build
   ```

### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t firebird-ui .
   ```
2. **Run the container**:
   ```bash
   docker run -p 3000:3000 firebird-ui
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the infra-service is running on `http://localhost:8080`
   - Check CORS configuration in the backend
   - Verify network connectivity
2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`
3. **Runtime Errors**
   - Check browser console for error messages
   - Verify API responses in Network tab
   - Ensure all required environment variables are set

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [infra-service documentation](../infra-service/README.md)
- Review the API documentation
- Open an issue in the repository

## Roadmap

- [ ] Complete all resource management pages (Volumes, Networks, Images)
- [ ] Add user management interface
- [ ] Implement project and role management
- [ ] Add advanced filtering and search
- [ ] Implement real-time notifications
- [ ] Add user authentication and authorization
- [ ] Create mobile-optimized views
- [ ] Add bulk operations
- [ ] Implement resource monitoring and alerts
