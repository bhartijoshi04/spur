import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ChatWidget } from './components/ChatWidget';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatWidget />
    </ThemeProvider>
  );
}

export default App;
