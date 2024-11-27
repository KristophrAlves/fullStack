import { Request, Response } from 'express';
import pool from '../bd/config';  // Importa a conexão com o banco de dados

// Controlador para buscar todos os motoristas usando SQL direto
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    // Consulta SQL para pegar todos os motoristas
    const result = await pool.query('SELECT * FROM drivers');

    // Verifica se encontrou motoristas
    if (result.rows.length === 0) {
      return res.status(404).json({
        error_code: 'NOT_FOUND',
        error_description: 'Nenhum motorista encontrado.',
      });
    }

    // Retorna a lista de motoristas com status 200 (OK)
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    return res.status(500).json({
      error_code: 'SERVER_ERROR',
      error_description: 'Ocorreu um erro ao buscar os motoristas.',
    });
  }
};
