import multer from 'multer'
import dotenv from 'dotenv'
import path from 'path'
import cloudinaryConfig from '../cloudinary/cloudinary.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import cloudinary from '../cloudinary/cloudinary.js'

//usando o dotenv para variaveis de ambiente
dotenv.config()


// Necessário para resolver diretórios com ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Caminho absoluto para a pasta de upload
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'categorie')

let storage

//verificar o ambiente atual
if(process.env.NODE_ENV === 'production'){
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "casacheia_uploads/category",
      format: async (req, file) => ('png', 'jpg', 'jpeg', 'webp'), // supports promises as well
      public_id: (req, file) => file.fieldname + '-' + Date.now()
    }
  })
}else{
  //configuracao do ambiente local, usando o multer diskStorage
  storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${Date.now()}-${name}${ext}`)
  }
})
}

//Filtro de tipos de arquivos aceitos
const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Tipo de arquivo não permitido'), false)
}

// Cria instância do multer
const upload = multer({ storage, fileFilter, limits: {fileSize: 5*1024*1024} })

export default upload