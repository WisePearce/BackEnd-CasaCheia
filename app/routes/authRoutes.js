import { Router} from "express"
import {register, login, logout, profile, updateUser} from "../controllers/authController.js"
import authenticateToken from "../middlewares/authMiddleware.js"

const route = Router()

const signin = route.post('/signup', register)
const loginUser = route.post('/signin', login)
const logoutUser = route.post('/logout', authenticateToken, logout)
//rota protegida para ir para o user profile
const profileUser = route.get('/profile', authenticateToken, profile)
const update = route.patch('/profile', authenticateToken, updateUser)

export {signin, loginUser, logoutUser, profileUser, update }