import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ShieldCheck, Smartphone, Globe, ArrowRight, Zap, CheckCircle2, Megaphone, Phone, MapPin, MonitorSmartphone, ShieldAlert, Search, Percent, Gift, Landmark, CreditCard, Banknote, Home, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark'; 
  const navigate = useNavigate();

  // Scroll animations for parallax effects
  const { scrollY } = useScroll();
  const cardY = useTransform(scrollY, [0, 500], [0, -150]);
  const textY = useTransform(scrollY, [0, 500], [0, 50]);

  // Framer motion variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col font-sans overflow-hidden relative"
    >
      {/* Background Decorators */}
      <div className={clsx("absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none", isDark ? "hidden" : "bg-redbanck-main/5")} />
      <div className={clsx("absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px] pointer-events-none", isDark ? "hidden" : "bg-redbanck-main/5")} />

      {/* Header Público */}
      <nav className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-300 px-8 md:px-16 lg:px-24 xl:px-32 py-5",
        isDark ? "bg-black/90 backdrop-blur-xl border-b border-white/10" : "bg-white/80 backdrop-blur-xl border-b border-black/5"
      )}>
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="font-extrabold tracking-tighter text-2xl flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              isDark ? "bg-redbanck-main text-white shadow-[0_0_20px_rgba(220,38,38,0.8)]" : "bg-redbanck-main text-white shadow-lg"
            )}>R</div>
            <span className={clsx("tracking-tight", isDark ? "text-white" : "text-black")}>RedBanck</span>
          </div>
          
          {/* Quick Access Links Top */}
          <nav className={clsx("hidden lg:flex items-center gap-6 font-bold text-sm", isDark ? "text-white" : "text-black/80")}>
            <a href="#" className="hover:text-redbanck-main transition-colors">Personas</a>
            <a href="#" className="hover:text-redbanck-main transition-colors">Empresas</a>
            <a href="#" className="hover:opacity-100 hover:text-redbanck-main transition-colors">Tarjetas</a>
            <a href="#" className="hover:opacity-100 hover:text-redbanck-main transition-colors">Préstamos</a>
            <a href="#" className="hover:opacity-100 hover:text-redbanck-main transition-colors">Beneficios</a>
          </nav>
        </div>
        
        <div className="flex gap-3 md:gap-5 items-center">
          {/* Buscador de Productos */}
          <div className={clsx(
            "hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border transition-all focus-within:w-[32rem] w-80",
            isDark ? "bg-white/5 border-white/10 focus-within:border-white text-white" : "bg-black/5 border-transparent focus-within:border-redbanck-main/30 focus-within:bg-white text-black"
          )}>
            <Search size={18} className="opacity-50" />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="bg-transparent outline-none w-full text-sm font-medium placeholder:opacity-50"
            />
          </div>

          <button 
            onClick={() => navigate('/login')}
            className={clsx(
              "hidden md:block font-bold px-6 py-2.5 rounded-full transition-all border-2",
              isDark ? "border-white/20 text-white hover:border-white" : "border-redbanck-main/20 text-redbanck-main hover:border-redbanck-main"
            )}
          >
            Abrir Cuenta
          </button>
          <button 
            onClick={() => navigate('/login')}
            className={clsx(
              "font-bold px-8 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl",
              isDark ? "bg-white text-black hover:bg-gray-200" : "bg-redbanck-main text-white hover:bg-[#A31C23]"
            )}
          >
            Ingresar
          </button>
        </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full pt-32 md:pt-48 px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text */}
          <motion.div 
            variants={containerVars} initial="hidden" animate="show"
            style={{ y: textY }}
            className="text-left z-10"
          >
            <motion.div variants={itemVars} className={clsx("inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-semibold text-sm tracking-wide shadow-sm", isDark ? "bg-[#111111] border border-white/10 text-white shadow-lg" : "bg-black/5 text-black border border-black/10")}>
              <Zap size={16} className="text-yellow-500 dark:text-yellow-400" /> El futuro de la banca digital
            </motion.div>
            
            <motion.h1 variants={itemVars} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
              El banco que <br/> respeta tu <br/>
              tiempo.
            </motion.h1>
            
            <motion.p variants={itemVars} className="text-xl md:text-2xl font-medium opacity-80 mb-10 max-w-lg leading-relaxed">
              Sin comisiones ocultas, sin filas, sin papeleo. Todo el control financiero desde tu celular o computadora.
            </motion.p>

            <motion.div variants={itemVars} className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/login')}
                className={clsx(
                  "text-lg font-bold px-10 py-5 rounded-full flex items-center justify-center gap-3 transition-all shadow-2xl hover:scale-105",
                  "bg-white text-black"
                )}
              >
                Comienza Ahora <ArrowRight size={24} />
              </button>
            </motion.div>
            
            <motion.div variants={itemVars} className="mt-10 flex gap-6 opacity-70 font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Cuenta gratuita</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Aprobación al instante</span>
            </motion.div>
          </motion.div>

          {/* Right Visual: Floating Glass Cards */}
          <motion.div 
            style={{ y: cardY }}
            className="relative hidden lg:flex justify-center items-center h-[600px] w-full perspective-1000 gap-4 xl:gap-6"
          >
            <motion.div 
              animate={{ y: [10, -10, 10], rotateY: [15, 20, 15], rotateZ: [-2, 0, -2] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              className="w-56 h-36 xl:w-64 xl:h-40 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 text-black border border-yellow-300 relative shadow-[0_0_100px_30px_rgba(234,179,8,0.6)]"
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="w-8 h-6 rounded bg-gradient-to-br from-[#E6C27A] to-[#C69C3E] p-[1px] shadow-sm" />
                <div className="text-sm font-bold tracking-widest opacity-80">R</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [-15, -35, -15], rotateX: [5, 10, 5], rotateY: [-5, 5, -5], rotateZ: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-72 h-44 xl:w-80 xl:h-48 rounded-[1.5rem] p-6 flex flex-col justify-between border overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700 text-white relative z-10 shadow-[0_0_120px_40px_rgba(255,255,255,0.4)]"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#E6C27A] via-[#FCE38A] to-[#C69C3E] p-[1px] relative overflow-hidden flex-shrink-0" />
                <div className="text-lg font-bold tracking-widest opacity-80">R</div>
              </div>
              <div className="relative z-10">
                <p className="font-mono text-lg tracking-widest opacity-90 mb-1">**** **** **** 8812</p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold uppercase tracking-widest text-xs opacity-80">Juan Perez</p>
                  <p className="font-bold text-sm">12/28</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -20, 0], rotateY: [-15, -20, -15], rotateZ: [2, 0, 2] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
              className="w-56 h-36 xl:w-64 xl:h-40 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-redbanck-main text-white border border-red-400/50 relative shadow-[0_0_100px_30px_rgba(220,38,38,0.6)]"
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="w-8 h-6 rounded bg-gradient-to-br from-[#E6C27A] to-[#C69C3E] p-[1px] shadow-sm" />
                <div className="text-sm font-bold tracking-widest opacity-90">R</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ¿Qué producto deseas hoy? (Slider) */}
        <div className="mt-40 w-full text-center overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">¿Qué producto deseas hoy?</h2>
          <div className="w-full overflow-hidden flex pb-12 pt-4 relative group/slider">
            {/* Fade effect edges */}
            <div className={clsx("absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none", isDark ? "hidden" : "bg-gradient-to-r from-white to-transparent")} />
            <div className={clsx("absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 pointer-events-none", isDark ? "hidden" : "bg-gradient-to-l from-white to-transparent")} />
            
            {/* Primer bloque Marquee */}
            <div className="flex animate-marquee group-hover/slider:[animation-play-state:paused] gap-5 md:gap-8 pr-5 md:pr-8">
              {[
                { icon: Landmark, title: "Cuentas" },
                { icon: CreditCard, title: "Tarjetas" },
                { icon: Banknote, title: "Préstamos" },
                { icon: Home, title: "Hipotecas" },
                { icon: ShieldCheck, title: "Seguros" },
                { icon: TrendingUp, title: "Inversiones" },
              ].map((prod, i) => (
                <motion.button 
                  key={`a-${i}`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "group relative min-w-[150px] md:min-w-[180px] flex-shrink-0 px-4 py-8 rounded-[1.8rem] flex flex-col items-center justify-center gap-5 transition-all duration-300",
                    isDark 
                      ? "bg-[#111111] border border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#444444] hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] text-white" 
                      : "bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-redbanck-main/20 text-black"
                  )}
                >
                  <div className={clsx(
                    "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    isDark ? "bg-white/5 text-white" : "bg-redbanck-main/10 text-redbanck-main"
                  )}>
                    <prod.icon size={36} strokeWidth={1.5} />
                  </div>
                  <span className={clsx("font-bold text-sm md:text-base tracking-wide transition-colors duration-300", isDark ? "text-white/80 group-hover:text-white" : "text-black/80 group-hover:text-redbanck-main")}>
                    {prod.title}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Segundo bloque Marquee (Duplicado exacto para el efecto continuo) */}
            <div className="flex animate-marquee group-hover/slider:[animation-play-state:paused] gap-5 md:gap-8 pr-5 md:pr-8">
              {[
                { icon: Landmark, title: "Cuentas" },
                { icon: CreditCard, title: "Tarjetas" },
                { icon: Banknote, title: "Préstamos" },
                { icon: Home, title: "Hipotecas" },
                { icon: ShieldCheck, title: "Seguros" },
                { icon: TrendingUp, title: "Inversiones" },
              ].map((prod, i) => (
                <motion.button 
                  key={`b-${i}`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={clsx(
                    "group relative min-w-[150px] md:min-w-[180px] flex-shrink-0 px-4 py-8 rounded-[1.8rem] flex flex-col items-center justify-center gap-5 transition-all duration-300",
                    isDark 
                      ? "bg-[#111111] border border-[#222222] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#444444] hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] text-white" 
                      : "bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-redbanck-main/20 text-black"
                  )}
                >
                  <div className={clsx(
                    "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    isDark ? "bg-white/5 text-white" : "bg-redbanck-main/10 text-redbanck-main"
                  )}>
                    <prod.icon size={36} strokeWidth={1.5} />
                  </div>
                  <span className={clsx("font-bold text-sm md:text-base tracking-wide transition-colors duration-300", isDark ? "text-white/80 group-hover:text-white" : "text-black/80 group-hover:text-redbanck-main")}>
                    {prod.title}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Grid with scroll-triggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 w-full px-8 md:px-16 lg:px-24 xl:px-32">
          {[
            { icon: ShieldCheck, title: "Seguridad Biométrica", desc: "Tus fondos están protegidos bajo los más estrictos estándares globales. Reconocimiento facial y dactilar integrado." },
            { icon: Smartphone, title: "Experiencia Líquida", desc: "Nuestra app y portal web fueron diseñados para ser ultra-rápidos, sin tiempos de espera ni pantallas saturadas." },
            { icon: Globe, title: "Transferencias Globales", desc: "Envía dinero a cualquier banco sin demoras. Conectados a la red interbancaria internacional en tiempo real." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
              whileHover={{ y: -10 }}
              className={clsx(
                "p-10 rounded-[2.5rem] glass-panel text-left flex flex-col gap-5 transition-all duration-500",
                isDark ? "bg-[#111111] border-[#222222] shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]" : "bg-white border-black/5 shadow-2xl"
              )}
            >
              <div className={clsx(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-inner",
                isDark ? "bg-white/10 text-white" : "bg-redbanck-main/10 text-redbanck-main"
              )}>
                <feature.icon size={32} strokeWidth={2} />
              </div>
              <h3 className={clsx("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-black")}>{feature.title}</h3>
              <p className={clsx("opacity-80 text-lg leading-relaxed font-medium", isDark ? "text-white" : "text-black")}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </main>

      {/* Seccion para Campañas */}
      <section className={clsx("w-full py-12 mt-20", isDark ? "bg-black text-white" : "bg-redbanck-main text-white shadow-inner")}>
        <div className="max-w-7xl mx-auto w-full text-left">
          <div className="flex items-center gap-3 mb-8 px-4">
            <Percent size={32} className="text-yellow-400" />
            <h2 className="text-4xl font-bold tracking-tight">Campañas Destacadas</h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { title: "Gana 10% Cashback", desc: "En todas tus compras en supermercados pagando con la Tarjeta de Crédito RedBanck.", bg: "bg-white/10" },
              { title: "Préstamo Vehicular 0%", desc: "Llévate tu auto soñado con una tasa de interés del 0% durante los primeros 6 meses.", bg: "bg-white/10" },
              { title: "Adelanto de Sueldo", desc: "Solicita hasta S/ 1,500 en un clic, sin evaluación crediticia. Directo a tu app.", bg: "bg-white/10" },
              { title: "Seguro Vida Cero", desc: "El primer seguro que te devuelve el 100% de tu dinero si no lo usas en 5 años.", bg: "bg-white/10" },
            ].map((camp, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className={clsx(
                  "min-w-[320px] md:min-w-[400px] p-8 rounded-[2rem] snap-start glass-panel transition-all shadow-xl flex flex-col justify-between h-[250px]",
                  isDark ? "bg-[#111111] border-[#222222] hover:bg-[#1A1A1A] shadow-[0_0_40px_rgba(220,38,38,0.2)] hover:shadow-[0_0_60px_rgba(220,38,38,0.4)] text-white" : "bg-white/10 border-white/10 hover:bg-white/20"
                )}
              >
                <div>
                  <h3 className="text-2xl font-extrabold mb-3">{camp.title}</h3>
                  <p className="opacity-90 font-medium text-lg leading-snug">{camp.desc}</p>
                </div>
                <button className="text-sm font-bold uppercase tracking-widest text-left opacity-100 flex items-center gap-2 hover:gap-3 transition-all">
                  Conoce más <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seccion para Beneficios */}
      <section className={clsx("w-full py-12 mt-16", isDark ? "bg-black text-white" : "bg-redbanck-main text-white shadow-inner")}>
        <div className="max-w-7xl mx-auto w-full text-left">
          <div className="flex items-center gap-3 mb-8 px-4">
            <Gift size={32} className="text-yellow-400" />
            <h2 className="text-4xl font-bold tracking-tight">Tus Beneficios</h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { title: "Cine 2x1", desc: "Disfruta tus películas favoritas a mitad de precio todos los martes y jueves.", label: "Entretenimiento" },
              { title: "20% en Restaurantes", desc: "Descuento exclusivo en más de 50 restaurantes a nivel nacional los fines de semana.", label: "Gastronomía" },
              { title: "Puntos RedBanck", desc: "Acumula puntos por cada sol de consumo y canjéalos por viajes o efectivo.", label: "Fidelidad" },
              { title: "Membresía Gratis", desc: "Mantenimiento y membresía S/ 0 consumiendo al menos S/ 1 al mes.", label: "Cuentas" },
            ].map((ben, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className={clsx(
                  "min-w-[280px] md:min-w-[350px] p-8 rounded-[2rem] snap-start glass-panel transition-all flex flex-col justify-between h-[220px]",
                  isDark ? "bg-[#111111] border-[#222222] hover:bg-[#1A1A1A] shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] text-white" : "bg-white/10 border-white/10 hover:bg-white/20"
                )}
              >
                <div>
                  <span className={clsx("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block", isDark ? "bg-white/10 text-white" : "bg-white/20 text-white")}>
                    {ben.label}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{ben.title}</h3>
                  <p className="opacity-90 font-medium text-sm leading-relaxed">{ben.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer / Canales Digitales & Contacto */}
      <footer className={clsx(
        "py-16 text-center border-t",
        isDark ? "bg-black border-white/10" : "bg-white border-black/5"
      )}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8">
          
          {/* Canales Digitales */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", isDark ? "bg-white/10 text-white" : "bg-white/5 text-black")}>
              <MonitorSmartphone size={24} />
            </div>
            <h4 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-black")}>Canales Digitales</h4>
            <p className={clsx("opacity-90 font-medium", isDark ? "text-white" : "text-black")}>Haz tus operaciones desde el app y la web.</p>
          </div>

          {/* Llámanos */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", isDark ? "bg-white/10 text-white" : "bg-redbanck-main/10 text-redbanck-main")}>
              <Phone size={24} />
            </div>
            <h4 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-black")}>Llámanos</h4>
            <p className={clsx("opacity-90 font-medium flex flex-col gap-1", isDark ? "text-white" : "text-black")}>
              <span><strong>01 311 6000</strong> (Lima)</span>
              <span><strong>0 801 1 6000</strong> (Provincia)</span>
            </p>
          </div>

          {/* Agencias */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", isDark ? "bg-white/10 text-white" : "bg-redbanck-main/10 text-redbanck-main")}>
              <MapPin size={24} />
            </div>
            <h4 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-black")}>Agencias</h4>
            <a href="#" className={clsx("opacity-90 hover:opacity-100 font-bold underline underline-offset-4 transition-all", isDark ? "text-white" : "text-black")}>
              Conoce tu agencia más cercana aquí
            </a>
          </div>

          {/* Creando Contigo */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", isDark ? "bg-white/10 text-yellow-400" : "bg-redbanck-main/10 text-yellow-500")}>
              <Megaphone size={24} />
            </div>
            <h4 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-black")}>Únete a Creando Contigo</h4>
            <p className={clsx("opacity-90 font-medium", isDark ? "text-white" : "text-black")}>Participa compartiendo tus ideas. ¡Te recompensaremos!</p>
            <a href="#" className={clsx("font-bold underline underline-offset-4 mt-1 opacity-90 hover:opacity-100", isDark ? "text-white" : "text-black")}>Conoce más</a>
          </div>

        </div>

        {/* Línea de Seguridad Extrema */}
        <div className={clsx(
          "max-w-7xl mx-auto mt-16 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-center text-center",
          isDark ? "bg-[#111111] border border-red-500/40 shadow-[0_0_40px_rgba(220,38,38,0.15)] text-white" : "bg-redbanck-main text-white"
        )}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="w-14 h-14 rounded-full bg-white/20 flex flex-shrink-0 items-center justify-center mx-auto md:mx-0">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h4 className="text-2xl font-bold">Línea 1820 - Mantente seguro</h4>
              <p className="opacity-90 mt-1 font-medium text-lg">Recuerda que puedes bloquear tus Tarjetas en una sola llamada al 1820, línea ASBANC</p>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos Inferiores (Bottom Quick Links) */}
        <div className={clsx("max-w-7xl mx-auto mt-16 pt-8 border-t border-current/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold", isDark ? "text-white opacity-90" : "text-black opacity-70")}>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <a href="#" className="hover:opacity-100 transition-opacity">Tasas y Tarifas</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Transparencia</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Trabaja con nosotros</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Términos y Condiciones</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Política de Privacidad</a>
          </div>
          <p>© 2026 RedBanck. Todos los derechos reservados.</p>
        </div>
      </footer>
    </motion.div>
  );
}
