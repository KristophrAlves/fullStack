import React, { useState, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

// Definir os tipos para as props
interface MapProps {
  origin: { latitude: number; longitude: number }
  destination: { latitude: number; longitude: number }
  routeResponse: google.maps.DirectionsResult | null
}

function Map({ origin, destination, routeResponse }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
    libraries: ['places'],
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)

  // Definir os marcadores
  const markers = [
    { lat: origin.latitude, lng: origin.longitude, label: 'Origem' },
    { lat: destination.latitude, lng: destination.longitude, label: 'Destino' },
  ]

  // Configurar o centro do mapa
  const center = {
    lat: (origin.latitude + destination.latitude) / 2,
    lng: (origin.longitude + destination.longitude) / 2,
  }

  // Função para calcular a rota
  const calculateRoute = () => {
    if (origin.latitude && destination.latitude) {
      const directionsService = new google.maps.DirectionsService()

      directionsService.route(
        {
          origin: { lat: origin.latitude, lng: origin.longitude },
          destination: { lat: destination.latitude, lng: destination.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result)
          } else {
            console.error('Erro ao calcular a rota:', status)
          }
        }
      )
    }
  }

  // Chama a função calculateRoute uma vez o mapa for carregado
  useEffect(() => {
    if (map) {
      calculateRoute()
    }
  }, [map, origin, destination]) // Dependências do useEffect

  // Exibe o Skeleton enquanto a API do Google Maps não estiver carregada
  if (!isLoaded) {
    return <Skeleton variant="rectangular" width="100%" height="40vh" />
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '40vh' }}>
      <GoogleMap
        center={center}
        zoom={10}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => setMap(map)}
      >
        {/* Marcadores para origem e destino */}
        {markers.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} label={marker.label} />
        ))}

        {/* Renderiza a rota, caso haja uma resposta de direção */}
        {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
      </GoogleMap>
    </Box>
  )
}

export default Map
