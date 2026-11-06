import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif'
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' }
            }
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
