import { Router} from "express"
import create from "../controllers/Auth.js"

const route = Router()

const auth = route.post('/sigin', create)

export default auth