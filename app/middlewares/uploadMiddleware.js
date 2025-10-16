import multer from "multer"
import fs from "fs"
import path from "path"
import supabase from "../config/supabaseClient.js"

async function uploadToSupabase(localPath, fileName, mimeType) {

  const { data, error } = await supabase.storage
    .from("product-image")
    .upload(fileName, fs.createReadStream(localPath), {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false
    })
  if (error) throw error
  const { data: publicUrl } = supabase.storage.from('produtos').getPublicUrl(fileName)
  return publicUrl.publicUrl

}

//salvar temporariamente no tmp

const upload = multer({ dest: '/tmp' })



export default upload