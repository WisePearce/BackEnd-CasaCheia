import { getUnreadNotifications, markAsRead } from "../config/services/notificationService.js";

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await getUnreadNotifications(userId);
        return res.status(200).json({
            status: true,
            data: notifications
        });
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        return res.status(500).json({
            status: false,
            message: "Erro interno no servidor."
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await markAsRead(id);
        if (!notification) {
            return res.status(404).json({
                status: false,
                message: "Notificação não encontrada."
            });
        }
        return res.status(200).json({
            status: true,
            message: "Notificação marcada como lida.",
            data: notification
        });
    } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        return res.status(500).json({
            status: false,
            message: "Erro interno no servidor."
        });
    }
};

export { getUserNotifications, markNotificationAsRead };
