import argon2 from "argon2";

const hashCode = async (code) => {
    try {
        return await argon2.hash(code);
    } catch (error) {
        console.error("Erro ao hashear o Codigo de 6 digitos:", error);
    }
}

export default hashCode;