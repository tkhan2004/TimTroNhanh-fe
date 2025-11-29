<template>
  <div class="map-view">
    <div v-if="!hasCoordinates" class="no-map-message">
      <svg viewBox="0 0 24 24" class="icon">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <p>Chưa có thông tin vị trí cho phòng này</p>
    </div>

    <div v-else class="map-container">
      <div ref="mapElement" class="map"></div>
      <div class="map-actions">
        <a 
          :href="googleMapsUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="view-google-maps-btn"
        >
          <svg viewBox="0 0 24 24" class="icon">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Xem trên Google Maps
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import L from 'leaflet'
import { LEAFLET_CONFIG } from '@/utils/leafletConfig'

const props = defineProps({
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Vị trí phòng'
  }
})

const mapElement = ref(null)
let map = null
let marker = null

const hasCoordinates = computed(() => {
  return props.latitude !== null && props.longitude !== null
})

const googleMapsUrl = computed(() => {
  if (!hasCoordinates.value) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${props.latitude},${props.longitude}`
})

// Initialize map
const initMap = () => {
  if (!hasCoordinates.value || !mapElement.value) return

  // Create map
  map = L.map(mapElement.value, {
    center: [props.latitude, props.longitude],
    zoom: 15,
    zoomControl: true,
    scrollWheelZoom: false
  })

  // Add tile layer
  L.tileLayer(LEAFLET_CONFIG.tileLayer.url, {
    attribution: LEAFLET_CONFIG.tileLayer.attribution,
    maxZoom: LEAFLET_CONFIG.tileLayer.maxZoom,
    minZoom: LEAFLET_CONFIG.tileLayer.minZoom
  }).addTo(map)

  // Add marker
  marker = L.marker([props.latitude, props.longitude]).addTo(map)

  // Add popup
  if (props.address || props.title) {
    const popupContent = `
      <div style="text-align: center;">
        <strong>${props.title}</strong>
        ${props.address ? `<br><small>${props.address}</small>` : ''}
      </div>
    `
    marker.bindPopup(popupContent).openPopup()
  }
}

// Update marker position
const updateMarker = () => {
  if (!map || !marker || !hasCoordinates.value) return

  const newLatLng = L.latLng(props.latitude, props.longitude)
  marker.setLatLng(newLatLng)
  map.setView(newLatLng, 15)

  // Update popup
  if (props.address || props.title) {
    const popupContent = `
      <div style="text-align: center;">
        <strong>${props.title}</strong>
        ${props.address ? `<br><small>${props.address}</small>` : ''}
      </div>
    `
    marker.setPopupContent(popupContent)
  }
}

onMounted(() => {
  if (hasCoordinates.value) {
    initMap()
  }
})

// Watch for coordinate changes
watch([() => props.latitude, () => props.longitude], () => {
  if (hasCoordinates.value) {
    if (!map) {
      initMap()
    } else {
      updateMarker()
    }
  }
})
</script>

<style scoped>
.map-view {
  width: 100%;
  margin: 2rem 0;
}

.no-map-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px dashed #d1d5db;
}

.no-map-message .icon {
  width: 48px;
  height: 48px;
  fill: #9ca3af;
  margin-bottom: 1rem;
}

.no-map-message p {
  color: #6b7280;
  margin: 0;
}

.map-container {
  position: relative;
}

.map {
  width: 100%;
  height: 400px;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.map-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.view-google-maps-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.view-google-maps-btn:hover {
  background: #2563eb;
}

.view-google-maps-btn .icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

@media (max-width: 768px) {
  .map {
    height: 300px;
  }
}
</style>
