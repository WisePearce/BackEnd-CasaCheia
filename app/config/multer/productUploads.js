import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

// 1. Configuração do Storage
// Usamos memoryStorage em produção para enviar o buffer direto para o ImgBB
// Em desenvolvimento, mantemos o diskStorage se você quiser salvar localmente
let storage;

if (process.env.NODE_ENV === 'production') {
  storage = multer.memoryStorage(); 
} else {
  storage = multer.diskStorage({
    destination: path.join(process.cwd(), 'uploads', 'products'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
    }
  });
}

// 2. Filtro de tipos de arquivos
const fileFilter = (req, any, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(any.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error(`Tipo de arquivo não permitido | use: '.png', '.jpg', '.jpeg', '.webp'`), false);
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Funcao para upload de imagens para o ImgBB, necessaria para subir as fotos dos produtos para a plataforma de hospedagem de imagens (imgBB).
// Você chamará esta função dentro do seu Controller
const uploadToImgBB = async (file)=>{
  const apiKey = process.env.IMGBB_API_KEY;
  
  if (!apiKey) throw new Error("IMGBB_API_KEY não configurada no .env");

  const formData = new FormData();
  // O ImgBB aceita base64 ou binário. O buffer do multer é perfeito aqui.
  formData.append("image", file.buffer.toString("base64"));

  try {
    const response = await axios.post(`${process.env.URL_IMGBB}?key=${apiKey}`, formData);
    return response.data.data.image.url; // Retorna a URL final da imagem
  } catch (error) {
    console.error("Erro ao subir para ImgBB:", error);
    throw new Error("Falha no upload da imagem");
  }
};

export {
  upload,
  uploadToImgBB
};