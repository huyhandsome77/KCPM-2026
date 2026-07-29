const dotenv = require('dotenv');

dotenv.config();

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'AppDatMon API',
        version: '1.0.0',
        description: 'Swagger UI for managing and testing AppDatMon backend endpoints.'
    },
    servers: [
        {
            url: baseUrl,
            description: 'Local development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ],
    paths: {
        '/': {
            get: {
                tags: ['System'],
                summary: 'Health check',
                responses: {
                    200: {
                        description: 'API is running'
                    }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user'
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive a JWT token'
            }
        },
        '/api/auth/test': {
            get: {
                tags: ['Auth'],
                summary: 'Test auth route'
            }
        },
        '/api/users': {
            get: {
                tags: ['Users'],
                summary: 'Get all users'
            },
            post: {
                tags: ['Users'],
                summary: 'Create a user'
            }
        },
        '/api/users/profile': {
            get: {
                tags: ['Users'],
                summary: 'Get current user profile'
            },
            put: {
                tags: ['Users'],
                summary: 'Update current user profile'
            }
        },
        '/api/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user by id'
            },
            put: {
                tags: ['Users'],
                summary: 'Update user by id'
            },
            delete: {
                tags: ['Users'],
                summary: 'Delete user by id'
            }
        },
        '/api/products': {
            get: {
                tags: ['Products'],
                summary: 'Get all products'
            },
            post: {
                tags: ['Products'],
                summary: 'Create a product'
            }
        },
        '/api/products/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get product by id'
            },
            put: {
                tags: ['Products'],
                summary: 'Update product by id'
            },
            delete: {
                tags: ['Products'],
                summary: 'Delete product by id'
            }
        },
        '/api/categories': {
            get: {
                tags: ['Categories'],
                summary: 'Get all categories'
            },
            post: {
                tags: ['Categories'],
                summary: 'Create a category'
            }
        },
        '/api/categories/{id}': {
            get: {
                tags: ['Categories'],
                summary: 'Get category by id'
            },
            put: {
                tags: ['Categories'],
                summary: 'Update category by id'
            },
            delete: {
                tags: ['Categories'],
                summary: 'Delete category by id'
            }
        },
        '/api/upload/image': {
            post: {
                tags: ['Uploads'],
                summary: 'Upload an image'
            }
        },
        '/api/reservations': {
            get: {
                tags: ['Reservations'],
                summary: 'Get all reservations'
            },
            post: {
                tags: ['Reservations'],
                summary: 'Create a reservation'
            }
        },
        '/api/reservations/my-reservations': {
            get: {
                tags: ['Reservations'],
                summary: 'Get current user reservations'
            }
        },
        '/api/reservations/{id}/check-in': {
            put: {
                tags: ['Reservations'],
                summary: 'Check in a reservation'
            }
        },
        '/api/reservations/{id}/cancel': {
            put: {
                tags: ['Reservations'],
                summary: 'Cancel a reservation'
            }
        },
        '/api/tables': {
            get: {
                tags: ['Tables'],
                summary: 'Get all tables'
            },
            post: {
                tags: ['Tables'],
                summary: 'Create tables in bulk is handled by /bulk'
            }
        },
        '/api/tables/qr/{qrCode}': {
            get: {
                tags: ['Tables'],
                summary: 'Get table by QR code'
            }
        },
        '/api/tables/bulk': {
            post: {
                tags: ['Tables'],
                summary: 'Create multiple tables at once'
            }
        },
        '/api/tables/{id}/status': {
            put: {
                tags: ['Tables'],
                summary: 'Update table status'
            }
        },
        '/api/orders': {
            get: {
                tags: ['Orders'],
                summary: 'Get all orders'
            },
            post: {
                tags: ['Orders'],
                summary: 'Create a new order'
            }
        },
        '/api/orders/my-orders': {
            get: {
                tags: ['Orders'],
                summary: 'Get current user orders'
            }
        },
        '/api/orders/{id}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order by id'
            },
            delete: {
                tags: ['Orders'],
                summary: 'Delete order by id'
            }
        },
        '/api/orders/{id}/status': {
            put: {
                tags: ['Orders'],
                summary: 'Update order status'
            }
        },
        '/api/orders/{id}/pay': {
            put: {
                tags: ['Orders'],
                summary: 'Mark order as paid'
            }
        },
        '/api/orders/table/{tableId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get current order by table'
            }
        },
        '/api/orders/table/{tableId}/pay-all': {
            put: {
                tags: ['Orders'],
                summary: 'Pay all orders for a table'
            }
        },
        '/api/reviews': {
            get: {
                tags: ['Reviews'],
                summary: 'Get all reviews'
            },
            post: {
                tags: ['Reviews'],
                summary: 'Create a review'
            }
        },
        '/api/reviews/{id}': {
            delete: {
                tags: ['Reviews'],
                summary: 'Delete a review'
            }
        },
        '/api/points/add-points': {
            post: {
                tags: ['Points'],
                summary: 'Add points from an order'
            }
        },
        '/api/stats': {
            get: {
                tags: ['Stats'],
                summary: 'Get dashboard stats'
            }
        },
        '/api/payos/debug': {
            get: {
                tags: ['PayOS'],
                summary: 'Debug PayOS configuration'
            }
        },
        '/api/payos/create-payment-link': {
            post: {
                tags: ['PayOS'],
                summary: 'Create a PayOS payment link'
            }
        },
        '/api/payos/order-status/{orderId}': {
            get: {
                tags: ['PayOS'],
                summary: 'Check order status by PayOS order id'
            }
        },
        '/api/payos/webhook': {
            post: {
                tags: ['PayOS'],
                summary: 'Receive PayOS webhook notifications'
            }
        },
        '/api/payos/payment-success': {
            get: {
                tags: ['PayOS'],
                summary: 'PayOS success return page'
            }
        },
        '/api/payos/payment-cancel': {
            get: {
                tags: ['PayOS'],
                summary: 'PayOS cancel return page'
            }
        }
    }
};

module.exports = swaggerSpec;