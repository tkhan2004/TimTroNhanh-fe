import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api'

/**
 * WebSocket Service
 * Manages STOMP WebSocket connection for real-time chat
 */
class WebSocketService {
    constructor() {
        this.client = null
        this.connected = false
        this.subscriptions = new Map()
        this.messageHandlers = []
        this.connectionHandlers = []
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
    }

    /**
     * Connect to WebSocket server
     * @param {string} token - JWT token for authentication
     */
    connect(token) {
        if (this.connected) {
            console.log('WebSocket already connected')
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            // Create WebSocket URL
            const wsUrl = API_BASE_URL.replace('/api', '') + API_ENDPOINTS.CHAT.WS_ENDPOINT

            // Create STOMP client with SockJS
            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),

                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },

                debug: (str) => {
                    console.log('[STOMP Debug]', str)
                },

                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,

                onConnect: (frame) => {
                    console.log('WebSocket connected:', frame)
                    this.connected = true
                    this.reconnectAttempts = 0

                    // Subscribe to personal message queue
                    this.subscribeToMessages()

                    // Notify connection handlers
                    this.connectionHandlers.forEach(handler => handler(true))

                    resolve()
                },

                onStompError: (frame) => {
                    console.error('STOMP error:', frame)
                    console.error('STOMP error headers:', frame.headers)
                    console.error('STOMP error body:', frame.body)
                    this.connected = false
                    this.connectionHandlers.forEach(handler => handler(false))
                    reject(new Error('WebSocket connection error'))
                },

                onWebSocketError: (event) => {
                    console.error('WebSocket error event:', event)
                },

                onWebSocketClose: () => {
                    console.log('WebSocket closed')
                    this.connected = false
                    this.connectionHandlers.forEach(handler => handler(false))

                    // Auto reconnect
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++
                        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
                    }
                }
            })

            // Activate the client
            this.client.activate()
        })
    }

    /**
     * Subscribe to personal message queue
     */
    subscribeToMessages() {
        if (!this.client || !this.connected) {
            console.error('Cannot subscribe: not connected')
            return
        }

        const subscription = this.client.subscribe('/user/queue/messages', (message) => {
            try {
                const chatMessage = JSON.parse(message.body)
                console.log('Received message:', chatMessage)

                // Notify all message handlers
                this.messageHandlers.forEach(handler => handler(chatMessage))
            } catch (error) {
                console.error('Error parsing message:', error)
            }
        })

        this.subscriptions.set('messages', subscription)
    }

    /**
     * Send a chat message
     * @param {Object} messageData - Message object {threadId, message}
     */
    sendMessage(messageData) {
        if (!this.client || !this.connected) {
            throw new Error('WebSocket not connected')
        }

        // Validate message content
        if (!messageData.message || messageData.message.trim() === '') {
            throw new Error('Message content cannot be empty')
        }

        console.log('Sending message:', messageData)

        this.client.publish({
            destination: '/app/chat',
            body: JSON.stringify({
                threadId: messageData.threadId,
                message: messageData.message
            })
        })
    }

    /**
     * Register a message handler
     * @param {Function} handler - Callback function to handle incoming messages
     * @returns {Function} Unsubscribe function
     */
    onMessage(handler) {
        this.messageHandlers.push(handler)

        // Return unsubscribe function
        return () => {
            const index = this.messageHandlers.indexOf(handler)
            if (index > -1) {
                this.messageHandlers.splice(index, 1)
            }
        }
    }

    /**
     * Register a connection status handler
     * @param {Function} handler - Callback function (connected: boolean)
     * @returns {Function} Unsubscribe function
     */
    onConnectionChange(handler) {
        this.connectionHandlers.push(handler)

        // Return unsubscribe function
        return () => {
            const index = this.connectionHandlers.indexOf(handler)
            if (index > -1) {
                this.connectionHandlers.splice(index, 1)
            }
        }
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.client) {
            // Unsubscribe all
            this.subscriptions.forEach(subscription => {
                subscription.unsubscribe()
            })
            this.subscriptions.clear()

            // Deactivate client
            this.client.deactivate()
            this.client = null
            this.connected = false

            console.log('WebSocket disconnected')
        }
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected
    }
}

// Export singleton instance
export const websocketService = new WebSocketService()
export default websocketService
