import { create } from 'zustand';
import { socket } from './socket';
import type { CardImageMap } from '@shared/models';

export type { CardImageMap };

interface ImageState {
  images: CardImageMap;
  isLoaded: boolean;
  preloadedUrls: Set<string>;
  loadProgress: number;
  error: string | null;
  
  // Actions
  fetchImages: () => Promise<void>;
  preloadAll: () => Promise<void>;
  updateImage: (key: keyof CardImageMap, url: string, password?: string) => Promise<{ success: boolean; error?: string }>;
}

const API_BASE_URL = 'https://virus-backend-8nvg.onrender.com';

const DEFAULT_IMAGES: CardImageMap = {
  "heart": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137322/Heart-organ_qtir3b.png",
  "brain": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137321/brain-organ_vtj7ki.png",
  "stomach": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137326/stomach-organ_rtr6yx.png",
  "bone": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137322/hueso-organ_kuxgq3.png",
  "wildcard": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137416/organ-comodin_ykiucy.png",
  "virus_red": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137328/virus-red_gbgfih.png",
  "virus_green": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137494/virus-green_haydbb.png",
  "virus_blue": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137493/virus-blue_ppgram.png",
  "virus_yellow": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137329/virus-yellow_nu4rey.png",
  "virus_wildcard": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137328/virus-comodin_xhnefb.png",
  "med_red": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137324/medicine-red_w3erjy.png",
  "med_green": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137324/medicine-green_tac2fn.png",
  "med_blue": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137323/medicine-blue_n1soqr.png",
  "med_yellow": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137325/medicine-yellow_ryuuiu.png",
  "med_wildcard": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137323/medicine-comodin_svgfv9.png",
  "sp_transplant": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137326/transplante-tratamiento_nh767f.png",
  "sp_thief": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137322/ladron-tratamiento_a2xpvy.png",
  "sp_infection": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137367/contagio-tratamiento_jwwnxb.png",
  "sp_error": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137321/errorMedico-tratamiento_x4t9zi.png",
  "sp_glove": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137322/guantes-latez-tratamiento_rupzef.png",
  "default": "https://res.cloudinary.com/diva0hfgm/image/upload/f_auto,q_auto,w_300/v1778137322/Heart-organ_qtir3b.png"
};

export const useImageManager = create<ImageState>((set, get) => {
  
  // Listen for socket updates
  socket.on('card_images_updated', (updatedImages: CardImageMap) => {
    set({ images: { ...DEFAULT_IMAGES, ...updatedImages } });
  });

  return {
    images: DEFAULT_IMAGES,
    isLoaded: false,
    preloadedUrls: new Set(),
    loadProgress: 0,
    error: null,

    fetchImages: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/card-images`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const data = await response.json();
        set({ images: { ...DEFAULT_IMAGES, ...data }, error: null });
      } catch (err: any) {
        console.error('Error fetching images:', err);
        set({ error: 'Usando imágenes locales por defecto' });
      }
    },

    preloadAll: async () => {
      const { images, preloadedUrls } = get();
      const urlsToLoad = (Object.values(images).filter(url => typeof url === 'string' && url !== '' && !preloadedUrls.has(url)) as string[]);
      
      if (urlsToLoad.length === 0) {
        set({ isLoaded: true, loadProgress: 100 });
        return;
      }

      set({ isLoaded: false, loadProgress: 0 });
      let loadedCount = 0;

      const promises = urlsToLoad.map((url: string) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            loadedCount++;
            set({ 
              loadProgress: Math.round((loadedCount / urlsToLoad.length) * 100),
              preloadedUrls: new Set<string>([...get().preloadedUrls, url])
            });
            resolve(url);
          };
          img.onerror = () => {
            loadedCount++;
            set({ loadProgress: Math.round((loadedCount / urlsToLoad.length) * 100) });
            resolve(url); // Resolve anyway to not block
          };
        });
      });

      await Promise.all(promises);
      set({ isLoaded: true, loadProgress: 100 });
    },

    updateImage: async (key, url, password = 'virus') => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/card-images/${String(key)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Update failed');
        }

        const updatedImages = await response.json();
        set({ images: updatedImages });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
  };
});
