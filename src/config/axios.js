import axios from 'axios'

export const $axios = axios.create({
  baseURL: 'https://localhost:7293/api'
})