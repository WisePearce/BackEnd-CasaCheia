const asyncUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Erro no upload:', err.message)
        return res.status(400).json({ error: err.message })
      }
      next()
    })
  }
}
export default asyncUpload