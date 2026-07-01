import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Home page — coming soon</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;