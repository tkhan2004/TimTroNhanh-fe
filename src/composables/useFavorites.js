import { ref, computed } from 'vue'
import { favoritesService } from '@/services/favoritesService'
import { useAuthStore } from '@/stores/auth'

/**
 * Favorites Composable
 * Manage favorites state and operations
 */
export function useFavorites() {
    const authStore = useAuthStore()

    // State
    const favorites = ref([])
    const loading = ref(false)
    const error = ref(null)
    const favoriteIds = ref([]) // Changed from Set to Array for reactivity

    /**
     * Load user's favorites
     */
    const loadFavorites = async () => {
        if (!authStore.isLoggedIn) {
            favorites.value = []
            favoriteIds.value = []
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await favoritesService.getMyFavorites()

            if (response.status === 200 && response.data) {
                favorites.value = response.data.content || response.data || []
                // Create array of favorite room IDs
                favoriteIds.value = favorites.value.map(room => room.id)
            }
        } catch (err) {
            console.error('Error loading favorites:', err)
            error.value = err.message || 'Không thể tải danh sách yêu thích'
            favorites.value = []
            favoriteIds.value = []
        } finally {
            loading.value = false
        }
    }

    /**
     * Check if a room is favorited
     * @param {number} roomId - Room ID
     * @returns {boolean} True if favorited
     */
    const isFavorite = (roomId) => {
        return favoriteIds.value.includes(roomId)
    }

    /**
     * Toggle favorite status for a room
     * @param {number} roomId - Room ID
     * @returns {Promise<boolean>} New favorite status
     */
    const toggleFavorite = async (roomId) => {
        if (!authStore.isLoggedIn) {
            throw new Error('Vui lòng đăng nhập để lưu phòng yêu thích')
        }

        try {
            const response = await favoritesService.toggleFavorite(roomId)

            if (response.status === 200) {
                const isFav = response.data?.isFavorite || false

                if (isFav) {
                    // Added to favorites - add to array if not exists
                    if (!favoriteIds.value.includes(roomId)) {
                        favoriteIds.value.push(roomId)
                    }
                } else {
                    // Removed from favorites - remove from array
                    favoriteIds.value = favoriteIds.value.filter(id => id !== roomId)
                    // Remove from favorites list if it's there
                    favorites.value = favorites.value.filter(room => room.id !== roomId)
                }

                console.log('Favorites updated:', { roomId, isFav, favoriteIds: favoriteIds.value })
                return isFav
            }
        } catch (err) {
            console.error('Error toggling favorite:', err)
            throw err
        }
    }

    /**
     * Add room to favorites
     * @param {number} roomId - Room ID
     */
    const addFavorite = async (roomId) => {
        if (!authStore.isLoggedIn) {
            throw new Error('Vui lòng đăng nhập để lưu phòng yêu thích')
        }

        try {
            await favoritesService.addFavorite(roomId)
            if (!favoriteIds.value.includes(roomId)) {
                favoriteIds.value.push(roomId)
            }
        } catch (err) {
            console.error('Error adding favorite:', err)
            throw err
        }
    }

    /**
     * Remove room from favorites
     * @param {number} roomId - Room ID
     */
    const removeFavorite = async (roomId) => {
        if (!authStore.isLoggedIn) {
            return
        }

        try {
            await favoritesService.removeFavorite(roomId)
            favoriteIds.value = favoriteIds.value.filter(id => id !== roomId)
            favorites.value = favorites.value.filter(room => room.id !== roomId)
        } catch (err) {
            console.error('Error removing favorite:', err)
            throw err
        }
    }

    // Computed
    const favoritesCount = computed(() => favorites.value.length)
    const hasFavorites = computed(() => favorites.value.length > 0)

    return {
        // State
        favorites,
        loading,
        error,
        favoriteIds,

        // Computed
        favoritesCount,
        hasFavorites,

        // Methods
        loadFavorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite
    }
}

export default useFavorites
