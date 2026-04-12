import Cart from '../models/cartModel.js'
import product from '../models/productModel.js'
import mongoose from 'mongoose'

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Produtos inválidos',
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const results = await Promise.all(
      items.map(async ({ productId, quantity }) => {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return {
            status: false,
            message: 'ID do produto inválido',
            productId,
          };
        }

        const verifyProduct = await product.findById(productId);
        if (!verifyProduct) {
          return {
            status: false,
            message: 'Produto não encontrado!',
            productId,
          };
        }

        if (verifyProduct.stock < quantity) {
          return {
            status: false,
            message: 'Estoque insuficiente',
            productId,
          };
        }

        return {
          status: true,
          productId,
          productData: verifyProduct,
          quantity
        };
      })
    );

    // Filtra erros
    const errors = results.filter(r => !r.status);

    if (errors.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'Erro ao adicionar produto(s) ao carrinho',
        errors,
      });
    }

    // Adiciona os produtos válidos no carrinho
    results.forEach(({ productId, productData, quantity }) => {
      const existingIndex = cart.items.findIndex(item =>
        item.product.equals(productId)
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          priceAtAdd: productData.price,
        });
      }
    });

    await cart.save();
    await cart.populate(
      [
        { path: 'user', select: 'name -password' },
        {
          path: 'items.product', populate: [
            { path: 'category', select: 'name' },
            { path: 'partner', select: 'name' },
          ]
        },
      ]);

    return res.status(200).json({
      status: true,
      message: 'Produto(s) adicionado(s) ao carrinho',
      cart,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
}
const getCart = async (req, res) => {
  try {
    const id = req.user.id
    const cart = await Cart.findOne({ user: id }).populate([
      { path: 'user', select: 'name -password' },
      {
        path: 'items.product', populate: [
          { path: 'category', select: 'name' },
          { path: 'partner', select: 'name' },
        ]
      },
    ]);

    if (cart.length == 0) {
      return res.status(200).json({
        status: false,
        message: "Seu carrinho esta vazio!"
      })
    }
    return res.status(200).json({
      status: true,
      carrinho: cart
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: false,
      message: "erro interno no servidor!"
    })
  }
}
const removeCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Produtos inválidos',
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        status: false,
        message: 'Carrinho não encontrado',
      });
    }

    const errors = [];

    for (const { productId, quantity } of items) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        errors.push({ productId, message: 'ID do produto inválido' });
        continue;
      }

      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingIndex === -1) {
        errors.push({ productId, message: 'Produto não encontrado no carrinho' });
        continue;
      }

      if (cart.items[existingIndex].quantity < quantity) {
        errors.push({ productId, message: 'Quantidade insuficiente' });
        continue;
      }

      cart.items[existingIndex].quantity -= quantity;

      if (cart.items[existingIndex].quantity === 0) {
        cart.items.splice(existingIndex, 1);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: false,
        message: 'Erro ao remover produto(s)',
        errors,
      });
    }

    await cart.save();
    await cart.populate([
      { path: 'user', select: 'name' },
      { path: 'items.product', populate: [
        { path: 'category', select: 'name' },
        { path: 'partner', select: 'name' },
      ]},
    ]);

    return res.status(200).json({
      status: true,
      message: 'Produto(s) removido(s) do carrinho',
      cart,
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: false,
      message: 'Erro interno no servidor',
    });
  }
};
export {
  addToCart,
  getCart,
  removeCart
}