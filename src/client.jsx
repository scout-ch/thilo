import axios from "axios";

// eslint-disable-next-line no-template-curly-in-string
const windowEnv = window.env.BACKEND_URL !== "${BACKEND_URL}" ? window.env.BACKEND_URL : ""
console.log(window.env.BACKEND_URL)
console.log(process.env.REACT_APP_BACKEND_URL || windowEnv || 'https://strapi.app.levell.ch/')
export default axios.create({
  // read baseULR for dev from .env file, for production from window.env (set by webpack)
  baseURL: process.env.REACT_APP_BACKEND_URL || windowEnv || 'https://strapi.app.levell.ch/',
  headers: {
    "Content-type": "application/json",
  },
});
