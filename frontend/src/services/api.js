import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000',
})

//Creates get fighter fucntion that has a limit and offset parameter to get a list of fighters from the API 
export const getFighters = (limit = 20, offset = 0) =>
  api.get(`/fighters?limit=${limit}&offset=${offset}`)

//Creates a search fighter function that gets a fighter by name from the API
export const searchFighters = (name) =>
  api.get(`/fighters/search?name=${name}`)

//creates a get fighter function that gets a fighter by id from the API
export const getFighter = (id) =>
  api.get(`/fighters/${id}`)

//Creates a get weight classes function that gets a list of weight classes from the API
export const getWeightClasses = () =>
  api.get('/weightclasses')

//Creates a get fighters by weight class function that gets a list of fighters from the API by weight class
export const getFightersByWeightClass = (weightClass) =>
  api.get(`/fighters/weightclass/${weightClass}`)

//Creates a get fighter fights function that gets a list of fights for a fighter from the API
export const getFighterFights = (name) =>
  api.get(`/fighters/${name}/fights`)

//Creates a get fighter record function that gets a fighter's record from their name from the API
export const getFighterRecord = (name) =>
  api.get(`/fighters/name/${name}/record`)