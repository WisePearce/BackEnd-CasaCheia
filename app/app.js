import express from "express"
import cors from "cors"
import { swaggerUi, swaggerSpec } from '../swegger.js' 
import authRouter from "./routes/authRoutes.js"
import helmet from "helmet"
import productRoutes from "./routes/productsRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import categorieRoutes from "./routes/categorieRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js"
import dotenv from "dotenv"
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRouter.js";
import orderItemsRouter from "./routes/itemOrderRouter.js";
import checkOutRouter from "./routes/checkOutRouter.js";
import userRouter from "./routes/userRoutes.js";
import passwordRouter from "./routes/forgotPasswordRoutes.js";
import storeRoutes from './routes/storeCoordinatsRouter.js';

const app = express()
dotenv.config()
//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(helmet())
app.use(cors())

//routes para usuario
//app.use('/api/auth', authRouter)
app.use('/api', authRouter)

//Route para forgot password e outrosimport Store from '../models/storeSchema.js';

// Criar loja
export const createStoreCoordinats = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    const loja = await Store.create({
      name,
      latitude,
      longitude,
    });

    res.status(201).json({
      status: true,
      message: 'coordenadas criada com sucesso',
      data: loja
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

// Buscar loja
export const findCoordinats = async (req, res) => {
  try {
    const loja = await Store.findOne();

    if (!loja) {
      return res.status(404).json({
        status: false,
        message: 'Coordenadas não encontrada'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Coordenadas da Loja encontrada',
      data: loja
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

// Atualizar loja
export const atualizarLoja = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    const loja = await Store.findOneAndUpdate(
      { owner: req.user.id },
      { name, latitude, longitude },
      { new: true, runValidators: true }
    );

    if (!loja) {
      return res.status(404).json({
        status: false,
        message: 'Loja não encontrada'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Loja atualizada com sucesso',
      data: loja
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

// Deletar loja
export const deletarLoja = async (req, res) => {
  try {
    const loja = await Store.findOneAndDelete({ owner: req.user.id });

    if (!loja) {
      return res.status(404).json({
        status: false,
        message: 'Loja não encontrada'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Loja deletada com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};
app.use('/api/auth', passwordRouter)

//routes para produtos
app.use('/api', productRoutes);

//routes para carrinho
app.use('/api', cartRouter)

//rote para categorias
app.use('/api', categorieRoutes);

//routes para order (pedidos)
app.use('/api', orderRouter);

//router para OrderItems (items do pedido)
app.use('/api', orderItemsRouter);

//router para Parceiros (Partner)
app.use('/api', partnerRoutes);

//Coordendas da loja
app.use('/api', storeRoutes);

//router para checkOutRouter
app.use('/api', checkOutRouter);

//route para listar todos os usuarios
app.use('/api', userRouter);


//api documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

//rota index
app.get('/', (req, res) => {
    res.send("API Casa-Cheia")
})

export default app
