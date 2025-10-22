import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Necessário para resolver diretórios com ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Caminho absoluto para a pasta de upload
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'categorie')

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${Date.now()}-${name}${ext}`)
  }
})

// Filtro de tipos de arquivos aceitos
const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Tipo de arquivo não permitido'), false)
}

// Cria instância do multer
const upload = multer({ storage, fileFilter })

export default upload
