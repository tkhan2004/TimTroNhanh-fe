<template>
  <div class="map-picker">
    <div class="map-container">
      <div ref="mapElement" class="map"></div>
      <div class="map-overlay" v-if="!mapReady">
        <div class="spinner"></div>
        <span>Đang tải bản đồ...</span>
      </div>
    </div>
    <div class="map-instructions">
      <small>💡 Click vào bản đồ hoặc kéo marker để chọn vị trí chính xác của phòng trọ.</small>
      <div v-if="latitude && longitude" class="coordinates-display">
        Tọa độ: {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import axios from 'axios'
import { LEAFLET_CONFIG, getCityCenter } from '@/utils/leafletConfig'

const props = defineProps({
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  city: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  ward: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:latitude', 'update:longitude', 'address-found'])

const mapElement = ref(null)
const mapReady = ref(false)
let map = null
let marker = null

// Initialize map
const initMap = () => {
  if (!mapElement.value) return

  // Default center (Hanoi or provided coordinates)
  const initialLat = props.latitude || LEAFLET_CONFIG.defaultCenter[0]
  const initialLng = props.longitude || LEAFLET_CONFIG.defaultCenter[1]
  const initialZoom = props.latitude ? 15 : LEAFLET_CONFIG.defaultZoom

  // Create map
  map = L.map(mapElement.value, {
    center: [initialLat, initialLng],
    zoom: initialZoom,
    zoomControl: true
  })

  // Add tile layer
  L.tileLayer(LEAFLET_CONFIG.tileLayer.url, {
    attribution: LEAFLET_CONFIG.tileLayer.attribution,
    maxZoom: LEAFLET_CONFIG.tileLayer.maxZoom,
    minZoom: LEAFLET_CONFIG.tileLayer.minZoom
  }).addTo(map)

  // Add marker if coordinates exist
  if (props.latitude && props.longitude) {
    addMarker(props.latitude, props.longitude)
  }

  // Handle map click
  map.on('click', (e) => {
    updateLocation(e.latlng.lat, e.latlng.lng)
  })

  mapReady.value = true
}

// Add draggable marker
const addMarker = (lat, lng) => {
  if (marker) {
    marker.setLatLng([lat, lng])
  } else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map)
    
    // Handle marker drag end
    marker.on('dragend', (e) => {
      const position = marker.getLatLng()
      updateLocation(position.lat, position.lng)
    })
  }
}

// Reverse Geocoding using Nominatim
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      }
    })
    
    if (response.data && response.data.address) {
      emit('address-found', response.data.address)
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error)
  }
}

// Update location and emit events
const updateLocation = (lat, lng) => {
  addMarker(lat, lng)
  emit('update:latitude', lat)
  emit('update:longitude', lng)
  
  // Trigger reverse geocoding
  reverseGeocode(lat, lng)
}

// Search location by query (City, District, Ward)
const searchLocation = async (query) => {
  if (!query) return
  
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        countrycodes: 'vn'
      }
    })
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0]
      const lat = parseFloat(result.lat)
      const lon = parseFloat(result.lon)
      
      if (map) {
        map.setView([lat, lon], 14) // Zoom closer for district/ward
      }
    }
  } catch (error) {
    console.error('Error searching location:', error)
  }
}

// Watch for address changes to re-center map
watch([() => props.city, () => props.district, () => props.ward], ([newCity, newDistrict, newWard]) => {
  if (props.latitude) return // Don't move if user already set a pin
  
  let query = ''
  if (newWard) query += `${newWard}, `
  if (newDistrict) query += `${newDistrict}, `
  if (newCity) query += newCity
  
  if (query) {
    searchLocation(query)
  }
}, { debounce: 500 })

// Watch for external coordinate changes
watch([() => props.latitude, () => props.longitude], ([newLat, newLng]) => {
  if (newLat && newLng && map) {
    addMarker(newLat, newLng)
    map.setView([newLat, newLng], 15)
  }
})

onMounted(() => {
  setTimeout(initMap, 100)
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.map-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.map-container {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  color: #6b7280;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-instructions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.coordinates-display {
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
</style>
