import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../features/auth/schemas';
import { login } from '../features/auth/api';
import { getApiErrorMessage } from '../services/api';

export default function Login() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const session = await login(data);
      navigate(session.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 relative"
    >
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 font-semibold opacity-80 hover:opacity-100 transition-opacity"
      >
        <ArrowLeft size={20} /> Volver
      </button>

      <motion.div 
        initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
        className={clsx(
          "w-full max-w-md p-10 rounded-[2rem] glass-panel shadow-2xl relative overflow-hidden",
          isDark ? "glass-panel-dark border-white/20" : "bg-white border-black/10"
        )}
      >
        <div className="text-center mb-10">
          <div className={clsx(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-extrabold mx-auto mb-6",
            isDark ? "bg-white text-redbanck-main" : "bg-redbanck-main text-white"
          )}>R</div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Bienvenido de nuevo</h2>
          <p className="opacity-70 font-medium">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 opacity-90">Documento de Identidad</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={20} />
              <input 
                type="text" 
                {...register('documentId')}
                placeholder="Ej. 12345678"
                className={clsx(
                  "w-full h-14 pl-12 pr-4 rounded-xl font-medium outline-none transition-all",
                  isDark ? "bg-black/20 focus:bg-black/40 text-white placeholder-white/40" : "bg-black/5 focus:bg-black/10 text-black placeholder-black/40",
                  errors.documentId && "border border-red-500"
                )}
              />
            </div>
            {errors.documentId && <span className="text-red-500 text-xs mt-1 block">{errors.documentId.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 opacity-90">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={20} />
              <input 
                type="password" 
                {...register('password')}
                placeholder="••••••••"
                className={clsx(
                  "w-full h-14 pl-12 pr-4 rounded-xl font-medium outline-none transition-all",
                  isDark ? "bg-black/20 focus:bg-black/40 text-white placeholder-white/40" : "bg-black/5 focus:bg-black/10 text-black placeholder-black/40",
                  errors.password && "border border-red-500"
                )}
              />
            </div>
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {serverError && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
              <AlertCircle size={18} className="flex-shrink-0" /> {serverError}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "w-full h-14 rounded-xl font-bold text-lg mt-2 flex justify-center items-center gap-2 transition-all shadow-lg",
              isDark ? "bg-white text-redbanck-main hover:bg-gray-100" : "bg-redbanck-main text-white hover:bg-redbanck-glass",
              isSubmitting && "opacity-80 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
              />
            ) : "Ingresar"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium opacity-80">
          ¿No tienes una cuenta? <Link to="/register" className="font-bold underline underline-offset-4">Ábrela aquí</Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
