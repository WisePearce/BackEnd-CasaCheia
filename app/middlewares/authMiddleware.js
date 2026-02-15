import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Verifica se o token foi fornecido
    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Token não informado. Usuário não autorizado!',
      });
    }

    // Valida o token JWT
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    //pegar o role do user
    const role = decoded.role

    //verificar se o user e admin
    if(role !== 'admin'){
      return res.status(403).json({
        status: false,
        message: 'Acesso negado, Area Restrita!'
      })
    }

    // Se passou, anexa o payload do user à requisição
    Object.assign(req, decoded)
    next();

  } catch (error) {
    // Captura erros específicos do JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: 'Token expirado. Faça login novamente.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        status: false,
        message: 'Token inválido, usuario nao autorizado.',
      });
    }

    // Caso algum erro inesperado
    return res.status(500).json({
      status: false,
      message: 'Erro na validação do token.',
    });
  }
};

export default authenticateToken;
