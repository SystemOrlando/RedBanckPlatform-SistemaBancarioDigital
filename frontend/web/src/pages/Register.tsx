import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '../features/auth/schemas';
import { register as registerUser } from '../features/auth/api';
import { getApiErrorMessage } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function Register() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      // El registro ya inicia sesión (devuelve tokens + usuario)
      await registerUser(data);
      reset();
      navigate('/dashboard');
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center p-6 relative">
      <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 font-semibold opacity-80 hover:opacity-100">
        <ArrowLeft size={20} /> Volver
      </button>
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className={clsx("w-full max-w-lg p-10 rounded-[2rem] glass-panel shadow-2xl relative", isDark ? "glass-panel-dark" : "bg-white border-black/10")}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Crear Cuenta</h2>
          <p className="opacity-70">Únete a RedBanck</p>
        </div>
        {/* autoComplete off: evita que el navegador rellene datos de registros previos */}
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold mb-1 block">Documento</label>
            <input {...register('documentId')} autoComplete="off" className={clsx("w-full h-12 px-4 rounded-xl", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")} />
            {errors.documentId && <span className="text-red-500 text-xs">{errors.documentId.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Nombre</label>
              <input {...register('firstName')} autoComplete="off" className={clsx("w-full h-12 px-4 rounded-xl", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")} />
              {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message}</span>}
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Apellido</label>
              <input {...register('lastName')} autoComplete="off" className={clsx("w-full h-12 px-4 rounded-xl", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")} />
              {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message}</span>}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Email</label>
            <input type="email" {...register('email')} autoComplete="off" className={clsx("w-full h-12 px-4 rounded-xl", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")} />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Contraseña</label>
            <input type="password" {...register('password')} autoComplete="new-password" className={clsx("w-full h-12 px-4 rounded-xl", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")} />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>
          {serverError && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
              <AlertCircle size={18} className="flex-shrink-0" /> {serverError}
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className={clsx("w-full h-14 rounded-xl font-bold mt-4", isDark ? "bg-white text-redbanck-main" : "bg-redbanck-main text-white")}>
            {isSubmitting ? "Registrando..." : "Registrarme"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}