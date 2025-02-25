import { createTheme } from '@mui/material/styles';

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
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        },
        columnHeader: {
          backgroundColor: '#F1F5F9', // Tailwind slate-100
          '&:hover': {
            backgroundColor: '#E2E8F0', // Tailwind slate-200
          },
        },
      },
    },
  },
});
