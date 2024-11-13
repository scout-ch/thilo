import axios from "axios";

// eslint-disable-next-line no-template-curly-in-string
const windowEnv = window.env.BACKEND_URL !== "${BACKEND_URL}" ? window.env.BACKEND_URL : ""
export default axios.create({
  // read baseULR for dev from .env file, for production from window.env (set by webpack)
  baseURL: import.meta.env.REACT_APP_BACKEND_URL || windowEnv || 'https://api.thilo.scouts.ch/',
  headers: {
    "Content-type": "application/json",
  },
});