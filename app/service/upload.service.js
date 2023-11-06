import axios from 'axios'

const API_URL = "https://marriott-e4uchtoxg-buiquangminh30.vercel.app"

cloudinaryUpload = (fileToUpload) => {
    return axios.post(API_URL + '/cloudinary-upload', fileToUpload)
    .then(res => res.data)
    .catch(err => console.log(err))
}

export default cloudinaryUpload
