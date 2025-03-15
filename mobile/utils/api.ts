import axios from "axios"

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://selftracker.ahmedlotfy.dev/"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
})

export default axiosInstance
