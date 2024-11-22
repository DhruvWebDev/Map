'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Location {
  position: [number, number]
  timestamp: number
}

export default function SingleUserMap() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const socketRef = useRef<Socket>()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io('http://localhost:3001')

    socketRef.current.on('connect', () => {
      setConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      setConnected(false)
    })

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Location = {
            position: [position.coords.latitude, position.coords.longitude],
            timestamp: Date.now()
          }
          setUserLocation(newLocation)
          socketRef.current?.emit('location_update', newLocation)
        },
        (error) => {
          console.error('Error watching location:', error)
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )

      return () => {
        navigator.geolocation.clearWatch(watchId)
        socketRef.current?.disconnect()
      }
    }
  }, [])

  if (!userLocation) {
    return <div className="flex items-center justify-center min-h-screen">Loading location...</div>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Real-time Location
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={userLocation.position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={userLocation.position}>
              <Popup>
                Your location
                <br />
                Updated: {new Date(userLocation.timestamp).toLocaleTimeString()}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}