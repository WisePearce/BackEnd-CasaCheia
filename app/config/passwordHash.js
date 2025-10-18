import argon2 from "argon2"

const hash_password = async(password) => {

    try {      
        const hash = await argon2.hash(password)
        return hash
    } catch (error) {
        console.log(error)
    }
}

const passwordVerification = async(hash, password) => {
    return argon2.verify(hash, password)
}

export  {hash_password, passwordVerification}