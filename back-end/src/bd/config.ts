import { Pool } from 'pg'; // Importa o Pool para gerenciar as conexões com o banco de dados

// Configuração do PostgreSQL
const pool = new Pool({
    user: 'postgres', // Usuário padrão
    host: 'postgres', // Endereço do servidor (pode ser 'localhost' ou o IP do servidor)
    database: 'rides', // Nome do banco de dados
    password: 'root', // Substitua com a senha do usuário 'postgres'
    port: 5434, // Porta padrão do PostgreSQL
});

// Função para testar a conexão com o banco de dados
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()'); // Consulta simples para verificar a conexão
        console.log('Conexão bem-sucedida com o PostgreSQL!');
        console.log('Resultado:', result.rows);
    } catch (error) {
        console.error('Erro na conexão com o banco de dados:', error);
    }
};

// Teste a conexão assim que o arquivo for carregado
testConnection();

// Exporta o pool de conexão para ser utilizado em outros arquivos
export default pool;

