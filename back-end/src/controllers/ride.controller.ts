import { Request, Response } from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';
import pool from '../bd/config';

dotenv.config();

const client = new Client();

// Função para buscar motoristas disponíveis com base na distância
const getAvailableDrivers = async (distance: number) => {
    try {
        // Arredondar a distância se necessário
        const roundedDistance = Math.round(distance);  // Isso converte para inteiro

        // Consulta SQL para pegar motoristas que aceitam a distância mínima
        const query = `
            SELECT id, name, description, vehicle, rating, rate_per_km, min_km 
            FROM drivers 
            WHERE min_km <= $1
        `;
        const result = await pool.query(query, [roundedDistance]);

        if (result.rows.length === 0) {
            return {
                error_code: 'NOT_FOUND',
                error_description: 'Nenhum motorista disponível para a distância.',
            };
        }

        // Ordenar motoristas pelo valor por km (rate_per_km)
        const drivers = result.rows.map((driver: any) => ({
            id: driver.id,
            name: driver.name,
            description: driver.description,
            vehicle: driver.vehicle,
            review: {
                rating: driver.rating,
                comment: ''
            },
            // rate_per_km: driver.rate_per_km,
            // minimum_distance: driver.min_km,
            value: (driver.rate_per_km * distance).toFixed(2),  // Calcula o valor total da corrida
        }));

        // Ordenar motoristas do mais barato para o mais caro
        drivers.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

        return drivers;
    } catch (error) {
        console.error('Erro ao buscar motoristas:', error);
        return {
            error_code: 'SERVER_ERROR',
            error_description: 'Erro ao buscar motoristas no banco de dados.',
        };
    }
};

export const estimateRide = async (req: Request, res: Response) => {
    try {
        const { origin, destination } = req.body;

        // Validações de entrada
        if (!origin || !destination) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'Os campos origin e destination são obrigatórios.',
            });
        }

        // Solicitar rota ao Google Maps API
        const response = await client.directions({
            params: {
                origin,
                destination,
                key: process.env.GOOGLE_API_KEY!,
            },
        });

        // Verifica se há rotas retornadas
        if (response.data.routes.length === 0) {
            return res.status(400).json({
                error_code: 'NO_ROUTE_FOUND',
                error_description: 'Nenhuma rota encontrada entre os pontos informados.',
            });
        }

        // Obter distância e duração da viagem
        const distanceInMeters = response.data.routes[0].legs[0].distance.value; // em metros
        const duration = response.data.routes[0].legs[0].duration.text; // duração da viagem
        const distanceInKm = distanceInMeters / 1000; // Convertendo metros para quilômetros

        // Latitude e longitude dos pontos de origem e destino
        const originLocation = response.data.routes[0].legs[0].start_location;
        const destinationLocation = response.data.routes[0].legs[0].end_location;

        const latitudeOrigin = originLocation.lat;
        const longitudeOrigin = originLocation.lng;
        const latitudeDestination = destinationLocation.lat;
        const longitudeDestination = destinationLocation.lng;

        // Buscar motoristas disponíveis para essa distância
        const drivers = await getAvailableDrivers(distanceInKm);

        // Retornar a resposta com as informações de rota e motoristas disponíveis
        return res.status(200).json({
            origin: {
                latitude: latitudeOrigin,
                longitude: longitudeOrigin,
            },
            destination: {
                latitude: latitudeDestination,
                longitude: longitudeDestination,
            },
            distance: distanceInKm,
            duration,
            options: drivers,
            routeResponse: response.data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 'SERVER_ERROR',
            error_description: 'Ocorreu um erro ao solicitar a rota ou buscar motoristas.',
        });
    }
};

// Função para buscar o motorista no banco de dados
const getDriverById = async (driverId: number) => {
    try {
        const query = 'SELECT * FROM drivers WHERE id = $1';
        const result = await pool.query(query, [driverId]);
        return result.rows[0]; // Retorna o motorista encontrado
    } catch (error) {
        console.error('Erro ao buscar motorista:', error);
        return null;
    }
};

// Função para salvar a viagem no banco de dados
const saveRideToHistory = async (rideData: any) => {
    try {
        const { customer_id, origin, destination, distance, duration, driver_id, value } = rideData;
        const query = `
            INSERT INTO Rides (customer_id, origin, destination, distance, duration, driver_id, value)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
        `;
        const result = await pool.query(query, [customer_id, origin, destination, distance, duration, driver_id, value]);
        return result.rows[0]; // Retorna o ID da viagem salva
    } catch (error) {
        console.error('Erro ao salvar viagem no histórico:', error);
        throw new Error('Erro ao salvar viagem no banco de dados.');
    }
};

// Endpoint para confirmar a viagem
export const confirmRide = async (req: Request, res: Response) => {
    try {
        const { customer_id, origin, destination, distance, duration, driver, value } = req.body;

        // Validação de dados obrigatórios
        if (!customer_id || !origin || !destination || !driver || !driver.id || !value) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'Dados obrigatórios ausentes.',
            });
        }

        // Validação: os endereços de origem e destino não podem ser os mesmos
        if (origin === destination) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: 'Os endereços de origem e destino não podem ser os mesmos.',
            });
        }

        // Verificar se o motorista informado existe
        const driverData = await getDriverById(driver.id);
        if (!driverData) {
            return res.status(404).json({
                error_code: 'DRIVER_NOT_FOUND',
                error_description: 'Motorista não encontrado.',
            });
        }

        // Verificar se a quilometragem informada é válida para o motorista
        if (distance < driverData.min_km) {
            return res.status(406).json({
                error_code: 'INVALID_DISTANCE',
                error_description: 'A quilometragem informada é inválida para o motorista.',
            });
        }

        // Salvar a viagem no banco de dados
        const rideData = {
            customer_id,
            origin,
            destination,
            distance,
            duration,
            driver_id: driver.id,
            value,
        };

        await saveRideToHistory(rideData);

        // Resposta de sucesso
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error('Erro ao confirmar viagem:', error);
        return res.status(500).json({
            error_code: 'SERVER_ERROR',
            error_description: 'Ocorreu um erro ao confirmar a viagem.',
        });
    }
};

export const getRides = async (req: Request, res: Response) => {
    try {
        const { customer_id } = req.params;
        const { driver_id } = req.query;

        // Validações
        if (!customer_id) {
            return res.status(400).json({
                error_code: "INVALID_CUSTOMER",
                error_description: "O ID do cliente é obrigatório.",
            });
        }

        if (driver_id && isNaN(Number(driver_id))) {
            return res.status(400).json({
                error_code: "INVALID_DRIVER",
                error_description: "O ID do motorista informado é inválido.",
            });
        }

        // Construir a query SQL
        let query = `
      SELECT 
        r.id, r.created_at AS date, r.origin, r.destination, r.distance, 
        r.duration, r.value, 
        d.id AS driver_id, d.name AS driver_name
      FROM Rides r
      JOIN Drivers d ON r.driver_id = d.id
      WHERE r.customer_id = $1
    `;

        const queryParams: any[] = [customer_id];

        if (driver_id) {
            query += ` AND r.driver_id = $2`;
            queryParams.push(driver_id);
        }

        query += ` ORDER BY r.created_at DESC`;

        // Executar a consulta no banco
        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error_code: "NO_RIDES_FOUND",
                error_description: "Nenhum registro encontrado para o cliente.",
            });
        }

        // Formatar a resposta
        const rides = result.rows.map((ride) => ({
            id: ride.id,
            date: ride.date,
            origin: ride.origin,
            destination: ride.destination,
            distance: ride.distance,
            duration: ride.duration,
            driver: {
                id: ride.driver_id,
                name: ride.driver_name,
            },
            value: ride.value,
        }));

        return res.status(200).json({ customer_id, rides });
    } catch (error) {
        console.error("Erro ao buscar viagens:", error);
        return res.status(500).json({
            error_code: "SERVER_ERROR",
            error_description: "Ocorreu um erro ao buscar as viagens.",
        });
    }
};

