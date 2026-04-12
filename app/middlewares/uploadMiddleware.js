const asyncUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (error) {
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            status: false,
            message: "Excedeu o limite de ficheiros, máximo de 4 imagens.",
          });
        }

        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: false,
            message: "Arquivo muito grande, limite máximo é 5MB.",
          });
        }

        return res.status(400).json({
          status: false,
          message: "Erro no upload: " + error.message,
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Pelo menos uma imagem é obrigatória.",
        });
      }

      next();
    });
  };
};

export default asyncUpload;