import React, { useState } from 'react';
import axios from 'axios';

interface LoginResponse {
  token: string;
}

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<LoginResponse>(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/login`,
        {
          email: "test@example.com",
          password: "Test123!"
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold mb-4">Connexion requise</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </div>
  );
}; 