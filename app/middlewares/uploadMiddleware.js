import multer from "multer"
import fs from "fs"
import path from "path"

async function uploadToSupabase(localPath, filename, mimeType) {
  const { data , error } = await 
}

//salvar temporariamente no tmp

const upload = multer({dest: '/tmp'})



export default upload