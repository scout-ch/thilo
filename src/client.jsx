import axios from "axios";

export default axios.create({
  baseURL: 'https://strapi.app.levell.ch/',
  headers: {
    "Content-type": "application/json",
  },
});
