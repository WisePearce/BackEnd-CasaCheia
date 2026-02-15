import User from "../models/userModel.js"
import sendMessages from "../config/services/ombalaService.js"
import generateCode from "../config/utils/randomCode.js"
import hashCode from "../config/utils/hashCode.js"
import updateSchema from "../config/updateSchema.js";
import redisClient from "../config/services/redis.js"
import argon2  from "argon2";

const listUsers = async (req, res) => {
  try {
    // paginação básica
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    // filtro: apenas usuários comuns
    const users = await User.find({ role: "user" })
      .select("name telefone role -password createdAt") // nunca retorne tudo
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments({ role: "user" })

    return res.status(200).json({
      status: true,
      message: "Lista de usuários",
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    })

  } catch (error) {
    console.error("Erro ao listar usuários:", error)

    return res.status(500).json({
      status: false,
      message: "Erro interno do servidor"
    })
  }
}

const listAllUsers = async (req, res) => {
  try {
    // paginação básica
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    // filtro: apenas usuários comuns
    const users = await User.find()
      .select("name telefone role -password createdAt") // nunca retorne tudo
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments()

    return res.status(200).json({
      status: true,
      message: "Lista de usuários",
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    })

  } catch (error) {
    console.error("Erro ao listar usuários:", error)

    return res.status(500).json({
      status: false,
      message: "Erro interno do servidor"
    })
  }
}
const updateUser = async (req, res) => {
    try {
        const dados = req.body

        if (dados === undefined || Object.keys(dados).length === 0) {
            console.log(`erro nos campos para atualizar dados ${dados}`)
            return res.status(400).json({
                status: false,
                message: "define o name de forma correta para fazer o update!!!",
            })
        }

        const payload = req.user
        const { error, value } = updateSchema.validate(dados)

        if (error) {
            console.log("Erro de validacao dos campos")
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        if (value.name == undefined) {
            console.log("Nenhum campo para atualizar")
            return res.status(400).json({
                status: false,
                message: "Nenhum campo para atualizar"
            })
        }
        const verUser = await User.findById(payload.id);
        if (!verUser) {
            console.log("Usuario nao encontrado para atualizar os dados!")
            return res.status(404).json({
                status: false,
                message: "Usuario nao encontrado para atualizar os dados!"
            })
        }
        if (value.name) verUser.name = value.name.trim();

        // Salva as alterações
        await verUser.save();
        return res.json({ message: 'Dados atualizado com sucesso!' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: 'Erro interno no servidor, contacte o suporte tecnico' });
    }

}

const updateTelefone = async (req, res) => {
    try {
        const telefone = req.body

        if (telefone === undefined || Object.keys(telefone).length === 0) {
            console.log(`erro nos campos para atualizar dados ${telefone}`)
            return res.status(400).json({
                status: false,
                message: "define o telefone de forma correta para fazer o update!!!",
                nota: "telefone deve ser unico, para usar como credencial de login"
            })
        }

        const payload = req.user
        const { error, value } = updateSchema.validate(telefone)

        if (error) {
            console.log("Erro de validacao de campo")
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        if (value.telefone == undefined) {
            console.log("Nenhum campo para atualizar")
            return res.status(400).json({
                status: false,
                message: "Nenhum campo para atualizar"
            })
        }
        const verUser = await User.findById(payload.id);
        if (!verUser) {
            console.log("Usuario nao encontrado para atualizar os dados!")
            return res.status(404).json({
                status: false,
                message: "Usuario nao encontrado para atualizar os dados!"
            })
        }

        const novoTelefone = value.telefone.trim();
            const user = await User.find({ telefone: novoTelefone });
            if (user.length !== 0) {
                console.log(user, "Numero de telefone em uso!")
                return res.status(400).json({
                    status: false,
                    message: "Numero de telefone em uso, use um novo número!"
                })
            }
            
            //gerar codigo de 6 digitos e fazer o hash
            const codeToSend = generateCode();
            //console.log("codigo gerado: ", codeToSend);
            const hashedCode = await hashCode(codeToSend);
            //console.log("codigo hasheado: ", hashedCode)

          //redis aqui entra em accao para guardar o hash por 10 minutos
          const parseRedisData = await redisClient.setEx(`telefone: ${novoTelefone}`, 600, JSON.stringify({
            code: hashedCode,
            attempts: 0,
            userData: novoTelefone
          }));

          //enviar o codigo da sms de 6 digitos para o usuario
          const send = await sendMessages(`Seu código para atualizar o número de telefone é: ${codeToSend}`, 'Casa Cheia', novoTelefone);

      //enviar resposta para o cliente
        return res.status(200).json({
            status: true,
            message: "Codigo de verificacao enviado com sucesso! por favor verifique seu telefone.",
            telefone: novoTelefone
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: 'Erro interno no servidor, contacte o suporte tecnico' });
    }

}

const verifyCode = async (req, res) => {
    try {
        //verificar se o telefone e o codigo foram enviados
        if (req.body === undefined || Object.keys(req.body).length === 0) {
            console.log("precisa informar o novo telefone e o código para verificar codigo")
            return res.status(400).json({
                status: false,
                message: "define o telefone e o codigo de forma correta!!!"
            })
        }

        const payload = req.user
        
        const { telefone, code } = req.body;
        if (!telefone || !code) {
            return res.status(400).json({
                status: false,
                message: "Telefone e código são obrigatórios."
            });
        }

        //validar telefone
        const { error, value } = updateSchema.validate({telefone});
        if (error) {
            console.log(`Erro de validacao do campo telefone: ${error}`);
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            });
        }
        //recuperar os dados do redis
        const redisData = await redisClient.get(`telefone: ${telefone}`);
        if (!redisData) {
            return res.status(400).json({
                status: false,
                message: "Código expirado ou inválido | verifique o numero de telefone. Por favor, tente novamente."
            });
        }
        const parseData = JSON.parse(redisData);

        console.log("teste: ", parseData.code);

        //verficar o numero de tentativas
        if (parseData.attempts >= 3) {
            await redisClient.del(`telefone: ${telefone}`);
            console.error("Número máximo de tentativas excedido para o código de verificação");
            return res.status(429).json({
                status: false,
                message: "Número máximo de tentativas excedido. Por favor, registre-se novamente."
            });
        }

        //verificar o codigo
        const isCodeValid = await argon2.verify(parseData.code, code);

        if (!isCodeValid) {
            parseData.attempts += 1;
            //atualizar o numero de tentativas no redis
            await redisClient.setEx(`new-user: ${telefone}`, 600, JSON.stringify(parseData));
            console.log("Codigo de verificação inválido");
            return res.status(400).json({
                status: false,
                message: "Código de verificação inválido."
            });
        }
        //pegar os dados do usuario para cadastrar
        const novoTelefone = telefone.trim();
        //Os dados estao limpos entao, bora cadastrar

        const verUser = await User.findById(payload.id);
        if (!verUser) {
            console.log("Usuario nao encontrado para atualizar os dados!")
            return res.status(404).json({
                status: false,
                message: "Usuario nao encontrado para atualizar os dados!"
            })
        }
        verUser.telefone = value.telefone.trim();

        // Salva as alterações
        await verUser.save();
        return res.json({ message: 'Número de telefone atualizado com sucesso!' });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: "Erro interno no servidor"
        });
    }

}

export {
  updateUser,
  updateTelefone,
  listUsers,
  listAllUsers,
  verifyCode
  
}
