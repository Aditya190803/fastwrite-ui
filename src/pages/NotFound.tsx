import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ShieldAlert, Home, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Access Violation - Sector Not Found:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="max-w-md w-full p-8 border border-white/5 bg-zinc-950/50 backdrop-blur-sm relative z-10 text-center">
        <div className="flex justify-center mb-8">
           <div className="p-4 bg-red-500/10 border border-red-500/20">
              <ShieldAlert className="h-12 w-12 text-red-500" />
           </div>
        </div>
        
        <div className="space-y-2 mb-8">
           <h1 className="text-6xl font-heading font-black text-white uppercase tracking-tighter">404</h1>
           <p className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] font-bold">NOT FOUND</p>
        </div>
        
        <div className="p-4 bg-black border border-white/5 text-left mb-8">
           <div className="flex items-center gap-2 mb-2 text-[8px] text-white/20 uppercase tracking-widest">
              <Terminal size={10} />
              <span>LOG</span>
           </div>
           <p className="text-[10px] text-white/40 uppercase tracking-tight break-all">
              Path [{location.pathname}] not found.
           </p>
        </div>

        <Button 
          variant="outline"
          asChild
          className="w-full rounded-none border-white/10 hover:border-primary hover:bg-primary hover:text-black font-mono text-[10px] uppercase tracking-[0.2em] h-12 transition-all"
        >
          <a href="/" className="flex items-center justify-center gap-2">
            <Home size={12} />
            HOME
          </a>
        </Button>

        <div className="mt-8 flex justify-between items-center opacity-20">
           <span className="text-[8px] uppercase tracking-widest">Error: 404</span>
           <div className="flex gap-1">
              {[1,2,3,4].map(i => <div key={i} className="w-1 h-2 bg-white" />)}
           </div>
        </div>
      </div>

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default NotFound;
