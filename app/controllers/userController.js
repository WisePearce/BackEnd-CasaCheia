import User from "../models/userModel.js"

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

export {
  listUsers,
  listAllUsers
}
