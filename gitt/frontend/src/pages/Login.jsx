import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Database, Lock, User, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { loginApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  correo:   z.string().email('Correo invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres')
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(s => s.setAuth);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginApi(data.correo, data.password);
      const { token, usuario } = res.data.data;
      setAuth(token, usuario);
      toast.success(`Bienvenido, ${usuario.nombre}`);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch { /* el interceptor ya muestra error */ }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-primary-600 p-3 rounded-full text-white mb-3">
              <Database className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">GITT</h1>
            <p className="text-sm text-gray-500">Gestion de Inventario Tecnologico</p>
            <p className="text-xs text-gray-400">FISEI - Universidad Tecnica de Ambato</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Correo institucional</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email" autoComplete="username"
                  className="input pl-10"
                  placeholder="usuario@uta.edu.ec"
                  {...register('correo')}
                />
              </div>
              {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo.message}</p>}
            </div>
            <div>
              <label className="label">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="password" autoComplete="current-password"
                  className="input pl-10"
                  placeholder="********"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Iniciar sesion
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            (c) 2026 Equipo GITT - FISEI
          </p>
        </div>
      </div>
    </div>
  );
}
