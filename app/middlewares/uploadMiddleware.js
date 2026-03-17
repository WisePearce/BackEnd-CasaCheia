const asyncUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if(req.files.length === 0){
        return res.status(400).json({
          status: false,
          message: "Precisa carregar pelo menos uma imagem para o produto"
        })
      }
      if (error) {
        console.log("teste: ", error)
        if(error.code === "LIMIT_UNEXPECTED_FILE") {
          console.log("teste: ", error)
          return res.status(400).json({
            status: false,
            message: "Excedeu o limite de ficheiro para upload, máximo de upload é 4 imagens."
          })
        }

        if(error.code === "LIMIT_FILE_SIZE") {
          console.log("arquivo muito grande! limite maximo deve ser 5MB")
          return res.status(400).json({
            status: false,
            message: "arquivo muito grande! limite maximo deve ser 5MB"
          })
        }
        console.log(error)
        return res.status(400).json({
          status: false,
          message: "Erro no upload de imagens. || "+error 
        })
      }
      next()
    })
  }
}
export default asyncUpload