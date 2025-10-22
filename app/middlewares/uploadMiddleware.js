const asyncUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (error) {
        if(error.code === "LIMIT_UNEXPECTED_FILE") {
          console.error("limite maximo de upload de imagens. Deve ser 4 para cada produto e 1 para cada categoria")
          return res.status(400).json({
            status: false,
            message: "Limite de upload de imagens excedido, maximo 4 imagens por produto e 1 por categoria"
          })
        }
        return res.status(400).json({
          status: false,
          message: "Erro no upload de imagens. || "+error.message 
        })
      }
      next()
    })
  }
}
export default asyncUpload