import { Router} from "express"
import {register, login} from "../controllers/Auth.js"

const route = Router()

const signin = route.post('/sigin', register)
const loginUser = route.post('/login', login)

export {signin, loginUser}