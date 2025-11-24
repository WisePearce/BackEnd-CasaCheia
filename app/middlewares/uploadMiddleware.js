const asyncUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      
      if (error) {
        console.log(error)
        if(error.code === "LIMIT_UNEXPECTED_FILE") {
          console.error("limite maximo de upload de imagens. Deve ser 4 para cada produto e 1 para cada categoria")
          return res.status(400).json({
            status: false,
            message: "Limite de upload de imagens excedido, maximo 4 imagens por produto e 1 por categoria"
          })
        }

        if(error.code === "LIMITE_FILE_SIZE") {
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