import { Schema , mongoose} from "mongoose";
import db from "../infra/db.js"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo'],
        default: 'ativo',
        require: false
    }
}, { timestamps: true } 
)

export default mongoose.model("Category", categorySchema);
/*

{
"id": 1,
"nome": "Grãos e Cereais",
"descricao": "Produtos como arroz, feijão, milho e lentilhas.",
"imagem": "
exemplo.com ",
"status": "ativo",
"data_criacao": "2025-10-17T10:00:00Z",
"data_atualizacao": "2025-10-17T10:00:00Z"
},
*/