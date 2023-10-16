import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL  || 'https://strapi.app.levell.ch/',
  headers: {
    "Content-type": "application/json",
  },
});
