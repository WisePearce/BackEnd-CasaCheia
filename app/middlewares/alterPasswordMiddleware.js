import
function passwordValidation () {
    return (req, res, next) => {
        const { password } = req.body

        if (!password) {
            return res.status(400).json({
                status: false,
                message: "Senha é obrigatória"
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: false,
                message: "Senha deve ter no mínimo 8 caracteres"
            })
        }
        
    }
}