import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../connection/axiosInstance';
import { Card, CardContent, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import Map from '../components/Map';

interface DriverOption {
  id: number;
  name: string;
  description: string;
  vehicle: string;
  review: {
    rating: number;
    comment: string;
  };
  value: number;
}

const OptionsPage = () => {
  const location = useLocation();
  const { origin, destination, options, distance, duration } = location.state.data;
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleConfirmRide = async (driverId: number) => {
    setLoading(true);
    const customerId = location.state.customer_id;

    try {
      await axiosInstance.patch('/ride/confirm', {
        customer_id: customerId,
        origin: location.state.startEnd.origin,
        destination: location.state.startEnd.destination,
        distance,
        duration,
        driver: { id: driverId },
        value: options.find((option: DriverOption) => option.id === driverId)?.value || 0,
      });
      navigate('/history', { state: { driverId, customer_id: customerId } });
    } catch {
      setError('Erro ao confirmar a viagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>Opções de Viagem</Typography>

      <Grid container spacing={2} direction="column">
        <Grid item>
          <Map origin={origin} destination={destination} routeResponse={null} />
        </Grid>

        <Grid item>
          <Typography variant="h6" gutterBottom>Motoristas Disponíveis</Typography>
          {options.length > 0 ? (
            options.map((option: DriverOption) => (
              <Card key={option.id} sx={{ marginBottom: '16px' }}>
                <CardContent>
                  <Typography variant="h6">
                    {option.name} ({option.vehicle})
                  </Typography>
                  <Typography variant="body2">{option.description}</Typography>
                  <Typography variant="body2">Avaliação: {option.review.rating}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Valor: R$
                    {typeof option.value === 'number'
                      ? option.value.toFixed(2)
                      : option.value}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleConfirmRide(option.id)}
                    sx={{ marginTop: '16px' }}
                  >
                    Escolher
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Nenhum motorista disponível no momento.
            </Typography>
          )}
        </Grid>

        {loading && (
          <Grid item>
            <CircularProgress />
          </Grid>
        )}
        {error && (
          <Grid item>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default OptionsPage;
