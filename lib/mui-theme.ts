import { createTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

// Augment the theme to include custom components
declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: SxProps<Theme>;
        cell?: SxProps<Theme>;
        columnHeader?: SxProps<Theme>;
      };
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F172A', // Tailwind slate-900
    },
    secondary: {
      main: '#475569', // Tailwind slate-600
    },
    error: {
      main: '#EF4444', // Tailwind red-500
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFC', // Tailwind slate-50
    },
  },
  typography: {
    fontFamily: 'var(--font-sans)',
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: 'transparent',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#F1F5F9', // Tailwind slate-100
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:hover': {
            backgroundColor: '#E2E8F0', // Tailwind slate-200
          },
        },
      },
    },
  },
});
