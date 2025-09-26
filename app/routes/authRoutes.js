import { Router} from "express"
import {register, login} from "../controllers/authController.js"

const route = Router()

const signin = route.post('/signup', register)
const loginUser = route.post('/signin', login)

export {signin, loginUser}