import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../connection/axiosInstance';

const RequestRidePage = () => {
    const [customerId, setCustomerId] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestRide = async () => {
        if (!customerId || !origin || !destination) {
            setError('Todos os campos são obrigatórios!');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post('/ride/estimate', {
                customer_id: customerId,
                origin,
                destination,
            });
            navigate('/options', {
                state: {
                    data: response.data,
                    customer_id: customerId,
                    startEnd: {
                        origin,
                        destination,
                    }
                }
            });
        } catch {
            setError('Erro ao solicitar a estimativa de viagem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>Solicitação de Viagem</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="ID do Usuário"
                        variant="outlined"
                        fullWidth
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Endereço de Origem"
                        variant="outlined"
                        fullWidth
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Endereço de Destino"
                        variant="outlined"
                        fullWidth
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </Grid>
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleRequestRide}
                        disabled={loading}
                    >
                        {loading ? 'Carregando...' : 'Solicitar Estimativa'}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default RequestRidePage;
