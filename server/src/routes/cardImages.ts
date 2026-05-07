import { Router, Request, Response } from 'express';
import { CardImageService, CardImageMap } from '../services/cardImageService';
import { optimizeCloudinaryUrl } from '../core/cloudinaryHelper';

const router = Router();
const UPDATE_PASSWORD = 'virus';

router.get('/', (req: Request, res: Response) => {
  const images = CardImageService.getAll();
  res.json(images);
});

router.put('/:cardType', (req: Request, res: Response) => {
  const { cardType } = req.params;
  const { imageUrl, password } = req.body;

  if (password !== UPDATE_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid password' });
  }

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  // Basic validation that it's a valid card type
  const images = CardImageService.getAll();
  
  // Solución TS2322: Garantizar que cardType sea string y no string[] (común en Express 5/Query)
  if (typeof cardType !== 'string' || !(cardType in images)) {
    return res.status(400).json({ error: 'Invalid card type' });
  }

  // AUTO-OPTIMIZATION
  const optimizedUrl = optimizeCloudinaryUrl(imageUrl);

  const updatedImages = CardImageService.update(cardType as keyof CardImageMap, optimizedUrl);
  
  // Notificar a todos por sockets
  const io = req.app.get('io');
  if (io) {
    io.emit('card_images_updated', updatedImages);
  }

  res.json(updatedImages);
});

export default router;
