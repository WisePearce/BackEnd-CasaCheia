import { Router} from "express"
import {register, login, logout, profile, updateUser, updatePassword} from "../controllers/authController.js"
import authenticateToken from "../middlewares/authMiddleware.js"
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js"

const route = Router()

const signin = route.post('/signup', register)
const loginUser = route.post('/signin', login)
const logoutUser = route.post('/logout', authenticateToken, logout)
const password = route.patch('/profile/password', authenticateTokenProfile, updatePassword)
//rota protegida para ir para o user profile
const profileUser = route.get('/profile', authenticateTokenProfile, profile)
const update = route.patch('/profile', authenticateTokenProfile, updateUser)

export {signin, loginUser, logoutUser, profileUser, update, password }