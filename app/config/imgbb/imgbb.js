import { imgbbUploader } from 'imgbb-uploader';

export default imgbbUploader({
    apiKey: process.env.API_KEY_IMAGE,
    base64string: null, // required, base64 string of the image
    name: "product", // optional, image name
    expiration: 600, // optional, time in seconds until the image expires
})