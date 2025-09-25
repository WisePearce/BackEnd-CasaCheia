import argon2 from "argon2"

const hash_password = async(password) => {

    try {      
        const hash = await argon2.hash(password)
        return hash
    } catch (error) {
        console.log(error)
    }
}
export default hash_password