import { Router } from "express";
import { 
    createPartner, 
    getPartners, 
    getPartnerById, 
    updatePartner, 
    deletePartner, 
    searchPartners 
} from "../controllers/partnerController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const route = Router();

// Rota para buscar parceiros (Query param: ?query=nome-ou-nif)
// IMPORTANTE: Esta rota deve vir ANTES de /partners/:id para não ser confundida
route.get('/partners/search', authenticateToken, searchPartners);

// Rota para criar novo parceiro
route.post('/partners', authenticateToken, createPartner);

// Rota para listar todos os parceiros
route.get('/partners', authenticateToken, getPartners);

// Rota para obter um parceiro por ID
route.get('/partners/:id', authenticateToken, getPartnerById);

// Rota para atualizar um parceiro por ID
route.patch('/partners/:id', authenticateToken, updatePartner);

// Rota para deletar um parceiro por ID
route.delete('/partners/:id', authenticateToken, deletePartner);

const partnerRoutes = route;
export default partnerRoutes;