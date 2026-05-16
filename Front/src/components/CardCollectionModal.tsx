import React, { useState } from 'react';
import { useImageManager, type CardImageMap } from '../core/useImageManager';
import { CardUI } from './CardUI';
import { X, Lock, Save, ArrowLeft, Image as ImageIcon, CheckCircle2, Loader2, Smile } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { REACTIONS } from '@shared/reactions';
import { useGameStore } from '../store/gameStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'heart', name: 'Corazón', type: 'organ', color: 'red' },
  { id: 'brain', name: 'Cerebro', type: 'organ', color: 'blue' },
  { id: 'stomach', name: 'Estómago', type: 'organ', color: 'green' },
  { id: 'bone', name: 'Huesos', type: 'organ', color: 'yellow' },
  { id: 'wildcard', name: 'Comodín', type: 'organ', color: 'wildcard' },
  { id: 'virus_red', name: 'Virus Rojo', type: 'virus', color: 'red' },
  { id: 'virus_green', name: 'Virus Verde', type: 'virus', color: 'green' },
  { id: 'virus_blue', name: 'Virus Azul', type: 'virus', color: 'blue' },
  { id: 'virus_yellow', name: 'Virus Amarillo', type: 'virus', color: 'yellow' },
  { id: 'virus_wildcard', name: 'Virus Comodín', type: 'virus', color: 'wildcard' },
  { id: 'med_red', name: 'Medicina Roja', type: 'medicine', color: 'red' },
  { id: 'med_green', name: 'Medicina Verde', type: 'medicine', color: 'green' },
  { id: 'med_blue', name: 'Medicina Azul', type: 'medicine', color: 'blue' },
  { id: 'med_yellow', name: 'Medicina Amarilla', type: 'medicine', color: 'yellow' },
  { id: 'med_wildcard', name: 'Medicina Comodín', type: 'medicine', color: 'wildcard' },
  { id: 'sp_transplant', name: 'Trasplante', type: 'treatment', color: 'wildcard' },
  { id: 'sp_thief', name: 'Ladrón', type: 'treatment', color: 'wildcard' },
  { id: 'sp_infection', name: 'Contagio', type: 'treatment', color: 'wildcard' },
  { id: 'sp_error', name: 'Error Médico', type: 'treatment', color: 'wildcard' },
  { id: 'sp_glove', name: 'Guante de Látex', type: 'treatment', color: 'wildcard' },
  { id: 'default', name: 'Fondo / Default', type: 'organ', color: 'wildcard' },
] as const;

export const CardCollectionModal: React.FC<CardCollectionModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCard, setEditingCard] = useState<typeof CATEGORIES[number] | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'cards' | 'reactions'>('cards');
  
  const { images, updateImage } = useImageManager();
  const addSocialEvent = useGameStore(state => state.addSocialEvent);
  const playerId = useGameStore(state => state.playerId);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.toLowerCase() === 'virus') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const startEditing = (card: typeof CATEGORIES[number]) => {
    setEditingCard(card);
    setNewUrl(images[card.id as keyof CardImageMap] || '');
  };

  const handleSave = async () => {
    if (editingCard) {
      setIsSaving(true);
      const result = await updateImage(editingCard.id as keyof CardImageMap, newUrl, adminPassword);
      setIsSaving(false);
      if (result.success) {
        setEditingCard(null);
      } else {
        alert(`Error al guardar: ${result.error}`);
      }
    }
  };

  const testReaction = (id: string) => {
    console.log('[TEST_REACTION] Attempting to test:', id, 'PlayerID:', playerId);
    if (playerId) {
      console.log('[TEST_REACTION] Adding event to store...');
      addSocialEvent({
        playerId,
        reactionId: id,
        timestamp: Date.now()
      });
    } else {
      console.warn('[TEST_REACTION] Failed: No PlayerID found in store');
    }
  };

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
        <div className="bg-slate-900 border-4 border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-blue-500/30">
              <Lock className="text-blue-400" size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Acceso Restringido</h2>
            <p className="text-slate-400 text-sm mb-8 font-medium">Ingresa la clave de administración para gestionar la colección.</p>
            
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input 
                type="password" 
                placeholder="Contraseña..."
                autoFocus
                className={cn(
                  "w-full bg-slate-800 border-4 border-slate-700 rounded-2xl px-6 py-4 text-center text-xl font-bold focus:border-blue-500 outline-none transition-all",
                  error && "border-red-500 animate-shake"
                )}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2">
                ENTRAR
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={cn(
          "bg-slate-900 w-full md:max-w-5xl md:h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/5",
          "mt-auto md:mt-0 rounded-t-[3rem] md:rounded-[3rem] md:border-4 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-500",
          "pb-[env(safe-area-inset-bottom)] h-[90vh] md:h-[85vh]"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-10 border-b border-white/5">
          <div className="flex items-center gap-4">
            {editingCard ? (
              <button onClick={() => setEditingCard(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                <ArrowLeft className="text-white" />
              </button>
            ) : (
              <div className="p-3 bg-blue-500/20 rounded-2xl border-2 border-blue-500/30">
                <ImageIcon className="text-blue-400" />
              </div>
            )}
            <div>
              <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                {editingCard ? `Editando: ${editingCard.name}` : 'Gestión de Activos'}
              </h2>
              <div className="flex gap-4 mt-2">
                 <button 
                  onClick={() => setActiveTab('cards')}
                  className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", activeTab === 'cards' ? "text-blue-400" : "text-slate-600")}
                 >
                   Cartas
                 </button>
                 <button 
                  onClick={() => setActiveTab('reactions')}
                  className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", activeTab === 'reactions' ? "text-blue-400" : "text-slate-600")}
                 >
                   Reacciones
                 </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all text-white/20 hover:text-white">
            <X size={32} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          {editingCard ? (
            /* EDITOR VIEW */
            <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-10 items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="shrink-0 scale-110 md:scale-125">
                 <CardUI 
                   card={{ id: 'preview', name: editingCard.name, type: editingCard.type as any, color: editingCard.color as any }} 
                 />
              </div>
              <div className="flex-1 w-full space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">URL de Imagen (Cloudinary preferido)</label>
                  <textarea 
                    rows={4}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full bg-slate-800 border-4 border-slate-700 rounded-2xl px-5 py-4 text-sm font-mono text-blue-300 focus:border-blue-500 outline-none transition-all resize-none"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 italic">La imagen se aplicará automáticamente a todas las cartas de este tipo.</p>
                </div>
                
                <div className="flex gap-4">
                   <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      "flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center gap-3 border-b-4 border-green-800",
                      isSaving && "opacity-50 cursor-not-allowed"
                    )}
                   >
                     {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                     {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                   </button>
                   <button 
                    onClick={() => setEditingCard(null)}
                    disabled={isSaving}
                    className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-black py-5 rounded-2xl transition active:scale-95 border-b-4 border-slate-800 disabled:opacity-50"
                   >
                     CANCELAR
                   </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'cards' ? (
            /* GRID VIEW - CARDS */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10 pb-10">
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => startEditing(cat)}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform active:scale-95"
                >
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-[1.5rem] transition-all -m-2 blur-xl" />
                  <CardUI 
                    card={{ id: cat.id, name: cat.name, type: cat.type as any, color: cat.color as any }} 
                    className="group-hover:ring-4 group-hover:ring-blue-500/50"
                  />
                  <div className="mt-4 text-center">
                    <span className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest block group-hover:text-blue-400 transition-colors">Editar</span>
                  </div>
                  {images[cat.id as keyof CardImageMap] && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-900 z-30">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* GRID VIEW - REACTIONS TESTER */
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 pb-10">
              {REACTIONS.map((r) => (
                <button 
                  key={r.id} 
                  onClick={() => testReaction(r.id)}
                  className="bg-white/5 hover:bg-blue-500/20 border-2 border-white/5 hover:border-blue-500/50 p-6 rounded-[2rem] flex flex-col items-center gap-3 transition-all active:scale-90 group"
                >
                  <span className="text-5xl group-hover:scale-125 transition-transform">{r.value}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
