import fs from 'fs';
import path from 'path';
import type { CardImageMap } from '../../../shared/index';
export type { CardImageMap };

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'card-images.json');

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
