import fs from 'fs';
import path from 'path';
import type { CardImageMap } from '../../../shared/index';
export type { CardImageMap };

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'card-images.json');

const DEFAULT_IMAGES: CardImageMap = {
  heart: "",
  brain: "",
  stomach: "",
  bone: "",
  wildcard: "",
  virus_red: "",
  virus_green: "",
  virus_blue: "",
  virus_yellow: "",
  virus_wildcard: "",
  med_red: "",
  med_green: "",
  med_blue: "",
  med_yellow: "",
  med_wildcard: "",
  sp_transplant: "",
  sp_thief: "",
  sp_infection: "",
  sp_error: "",
  sp_glove: "",
};

export class CardImageService {
  private static ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_IMAGES, null, 2));
    }
  }

  static getAll(): CardImageMap {
    this.ensureDataFile();
    try {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      return { ...DEFAULT_IMAGES, ...JSON.parse(data) };
    } catch (error) {
      console.error('Error reading card images file:', error);
      return DEFAULT_IMAGES;
    }
  }

  static update(cardType: keyof CardImageMap, imageUrl: string) {
    this.ensureDataFile();
    const images = this.getAll();
    images[cardType] = imageUrl;
    fs.writeFileSync(FILE_PATH, JSON.stringify(images, null, 2));
    return images;
  }
}
