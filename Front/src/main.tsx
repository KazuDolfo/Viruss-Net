import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useImageManager } from './core/useImageManager'

const Main = () => {
  const { fetchImages, preloadAll } = useImageManager();

  useEffect(() => {
    const init = async () => {
      await fetchImages();
      preloadAll(); // Start preloading in background
    };
    init();
  }, [fetchImages, preloadAll]);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
