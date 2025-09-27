import { Router} from "express"
import {register, login, logout, profile} from "../controllers/authController.js"
import authenticateToken from "../middlewares/authMiddleware.js"

const route = Router()

const signin = route.post('/signup', register)
const loginUser = route.post('/signin', login)
const logoutUser = route.post('/logout', logout)
const profileUser = route.get('/profile', authenticateToken)

export {signin, loginUser, logoutUser, profileUser }