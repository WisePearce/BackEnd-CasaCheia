// src/controllers/order.controller.js
import Order from '../models/orderModel.js';
import ItemsOrder from '../models/itemOrderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import ShippingAddress from '../models/shippingAdressModel.js';
import PaymentMethod from '../models/paymentMethodModel.js';
import Joi from 'joi';
