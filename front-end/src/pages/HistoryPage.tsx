import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import axiosInstance from '../connection/axiosInstance';
import { useLocation } from 'react-router-dom';

const HistoryPage = () => {
    const location = useLocation();
    const [userId, setUserId] = useState<string>(location?.state?.customer_id ? location.state.customer_id : '');
    const [driverId, setDriverId] = useState<number | ''>(location?.state?.driverId ? location.state.driverId : '');  // O driverId pode ser vazio
    const [drivers, setDrivers] = useState<any[]>([]); // Lista de motoristas
    const [rides, setRides] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);  // Para controlar o estado de carregamento
    const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false); // Carregando motoristas

    // Buscar motoristas da API
    useEffect(() => {
        const fetchDrivers = async () => {
            setLoadingDrivers(true);
            try {
                const response = await axiosInstance.get('/driver/drivers');
                setDrivers(response.data);
            } catch (err) {
                setError('Erro ao buscar motoristas.');
            } finally {
                setLoadingDrivers(false);
            }
        };

        fetchDrivers();
    }, []);

    useEffect(() => {
        if (userId && driverId) {
            handleSearch();
        }
    }, [])

    const handleSearch = async () => {
        setLoading(true);
        setError(null); // Limpar erro anterior
        try {
            const response = await axiosInstance.get(`/ride/${userId}`, {
                params: { driver_id: driverId || undefined },  // Se driverId estiver vazio, não inclui o parâmetro
            });
            setRides(response.data.rides);
        } catch (err) {
            setError('Nenhum histórico encontrado.');
            setRides([])
        } finally {
            setLoading(false);
        }
    };

    const handleDriverChange = (event: SelectChangeEvent<number | ''>) => {
        // Verifica se o valor é uma string vazia ou um número
        const value = event.target.value === '' ? '' : Number(event.target.value);
        setDriverId(value);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>Histórico de Viagens</Typography>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        label="ID do Usuário"
                        variant="outlined"
                        fullWidth
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </Grid>

                <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Motorista</InputLabel>
                        <Select
                            value={driverId}
                            onChange={handleDriverChange}
                            label="Motorista"
                        >
                            {/* Exibir opção para todos os motoristas ou nenhum motorista */}
                            <MenuItem value={''}>Todos os motoristas</MenuItem>

                            {/* Exibir motoristas da lista */}
                            {drivers.map((driver) => (
                                <MenuItem key={driver.id} value={driver.id}>
                                    {driver.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        fullWidth
                    >
                        Buscar Histórico
                    </Button>
                </Grid>
            </Grid>

            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}

            {rides.length > 0 && (
                <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Data</TableCell>
                                <TableCell>Motorista</TableCell>
                                <TableCell>Origem</TableCell>
                                <TableCell>Destino</TableCell>
                                <TableCell>Distância</TableCell>
                                <TableCell>Duração</TableCell>
                                <TableCell>Valor</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rides.map((ride, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(ride.date).toLocaleString()}</TableCell>
                                    <TableCell>{ride.driver.name}</TableCell>
                                    <TableCell>{ride.origin}</TableCell>
                                    <TableCell>{ride.destination}</TableCell>
                                    <TableCell>{ride.distance} km</TableCell>
                                    <TableCell>{ride.duration}</TableCell>
                                    <TableCell>R${ride.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default HistoryPage;
