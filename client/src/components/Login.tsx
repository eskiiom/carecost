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

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('REACT_APP_API_URL n\'est pas défini dans le fichier .env');
      }

      const response = await axios.post<LoginResponse>(
        `${apiUrl}/api/auth/login`,
        {
          email: "test@example.com",
          password: "Test123!"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const error = err as any;
      
      if (error.code === 'ERR_NETWORK') {
        setError(`Impossible de se connecter au serveur. Vérifiez que :
          - Le serveur backend est en cours d'exécution
          - L'URL de l'API est correcte
          - Vous avez accès au serveur depuis votre machine`);
      } else if (error.response?.status === 401) {
        setError('Identifiants incorrects');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Erreur de validation');
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold mb-4">Connexion requise</h2>
      {error && <div className="text-red-500 mb-4 whitespace-pre-line">{error}</div>}
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