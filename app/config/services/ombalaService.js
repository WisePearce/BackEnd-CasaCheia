import axios from "axios";
import dotenv from "dotenv";

// Carregar variáveis de ambiente   

dotenv.config();

const sendMessages = async (message, from, to) => {
    try {

        const response = await axios.post(process.env.URL_OMBALA, {
            "message": message,
            "from": from,
            "to": to
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${process.env.TOKEN_OMBALA}`
            }
        }
    )
    } catch (error) {
        if(error.response){
            console.error("Erro da API OMBALA: ", error.response.data);
        }else if(error.request){
            console.error("Erro na Requisicao: ", error.request);
        }else{
            console.error("Erro ao enviar mensagem: ", error.message);
        }
    }
}
export default sendMessages;