import axios from 'axios';

// Crie uma instância do axios com a configuração da URL base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Substitua pela URL da sua API
  headers: {
    'Content-Type': 'application/json', // Especificando o tipo de conteúdo
  },
});

export default axiosInstance;
