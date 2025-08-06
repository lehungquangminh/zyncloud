# API Endpoints

This document provides a comprehensive list of all available API endpoints for the application.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Admin Panel](#admin-panel)
  - [Services Management](#services-management)
  - [Package Management](#package-management)
  - [Order Management](#order-management)
  - [Customer Management](#customer-management)
  - [Admin Wallet Management](#admin-wallet-management)
- [Payments](#payments)
- [System](#system)

---

## Authentication

### `POST /api/auth/discord`

Initiates the Discord OAuth2 authentication flow.

### `GET /api/auth/discord/callback`

Callback URL for Discord OAuth2. Handles the token exchange and user creation/login.

---

## User Management

### `GET /api/user/me`

- **Description:** Retrieves the profile of the currently authenticated user.
- **Authentication:** `protect`
- **Response:**
  ```json
  {
    "id": "string",
    "email": "user@example.com",
    "username": "string",
    // ... other user fields
  }
  ```

### `GET /api/user/wallet/balance`

- **Description:** Gets the current wallet balance for the authenticated user.
- **Authentication:** `protect`

### `GET /api/user/wallet/transactions`

- **Description:** Retrieves the transaction history for the authenticated user's wallet.
- **Authentication:** `protect`

### `POST /api/user/wallet/topup-card`

- **Description:** Submits a new top-up request using a phone card.
- **Authentication:** `protect`
- **Body:** `{ "card_telco": "VIETTEL", "card_amount": 10000, "card_serial": "...", "card_pin": "..." }`

### `POST /api/user/wallet/topup-bank`

- **Description:** Creates a new bank transfer top-up request.
- **Authentication:** `protect`
- **Body:** `{ "requested_amount": 50000 }`

### `GET /api/user/wallet/topup-history`

- **Description:** Fetches the history of top-up requests for the authenticated user.
- **Authentication:** `protect`

### `GET /api/user/wallet/payment-methods`

- **Description:** Lists all available and active payment methods.
- **Authentication:** None

---

## Admin Panel

All admin endpoints are protected by `protect` and `admin` middleware.

### Services Management

- **`GET /api/admin/services`**: List all services.
- **`POST /api/admin/services`**: Create a new service.
- **`GET /api/admin/services/{id}`**: Get details for a specific service.
- **`PUT /api/admin/services/{id}`**: Update a service.
- **`DELETE /api/admin/services/{id}`**: Delete a service.
- **`PUT /api/admin/services/{id}/toggle-status`**: Toggle the status of a service between active and inactive.

### Package Management

- **`GET /api/admin/services/{serviceId}/packages`**: List all packages for a specific service.
- **`POST /api/admin/services/{serviceId}/packages`**: Create a new package for a service.
- **`GET /api/admin/packages/{id}`**: Get details for a specific package.
- **`PUT /api/admin/packages/{id}`**: Update a package.
- **`DELETE /api/admin/packages/{id}`**: Delete a package.
- **`PUT /api/admin/packages/reorder`**: Update the sort order of packages.

### Order Management

- **`GET /api/admin/orders`**: List all orders with optional filters.
- **`GET /api/admin/orders/stats`**: Get order statistics.
- **`GET /api/admin/orders/{id}`**: Get details for a specific order.
- **`PUT /api/admin/orders/{id}/status`**: Update the status of an order.
- **`POST /api/admin/orders/{id}/refund`**: Process a refund for an order.
- **`PUT /api/admin/orders/{id}/notes`**: Update admin notes for an order.

### Customer Management

- **`GET /api/admin/customers`**: List all customers with optional search/filters.
- **`GET /api/admin/customers/{id}`**: Get details for a specific customer.
- **`GET /api/admin/customers/{id}/orders`**: Get the order history for a customer.
- **`GET /api/admin/customers/{id}/servers`**: Get active servers for a customer.
- **`PUT /api/admin/customers/{id}/status`**: Update the status of a customer account.
- **`GET /api/admin/customers/{id}/pterodactyl`**: Get a customer's Pterodactyl account info.

### Admin Wallet Management

- **`GET /api/admin/wallet/transactions`**: List all wallet transactions.
- **`POST /api/admin/wallet/add-money`**: Add money to a user's wallet.
- **`POST /api/admin/wallet/subtract-money`**: Subtract money from a user's wallet.
- **`GET /api/admin/wallet/reports`**: Get financial reports.
- **`GET /api/admin/topup/pending`**: Get a list of pending top-up requests.
- **`POST /api/admin/topup/{id}/approve`**: Approve a pending top-up request.
- **`POST /api/admin/topup/{id}/reject`**: Reject a pending top-up request.
- **`GET /api/admin/exchange-rates`**: Manage exchange rates for phone cards.
- **`PUT /api/admin/exchange-rates/{id}`**: Update an exchange rate.
- **`GET /api/admin/payment-methods`**: Manage payment methods.
- **`PUT /api/admin/payment-methods/{id}/toggle`**: Toggle the status of a payment method.

---

## Payments

### `POST /api/payments/verify-card`

- **Description:** Verifies a phone card with the external API.
- **Authentication:** `protect`

### `POST /api/payments/process-card`

- **Description:** Processes a card payment.
- **Authentication:** `protect`

### `GET /api/payments/exchange-rates`

- **Description:** Get the current exchange rates for card top-ups.
- **Authentication:** None

### `GET /api/payments/bank-info`

- **Description:** Get the bank account information for bank transfers.
- **Authentication:** None

### `POST /api/payments/bank-transfer`

- **Description:** Create a bank transfer request.
- **Authentication:** `protect`

### `POST /api/payments/process-order`

- **Description:** Process the payment for a specific order.
- **Authentication:** `protect`
- **Body:** `{ "orderId": "string", "paymentMethod": "WALLET" }`

### `GET /api/payments/order/{id}/status`

- **Description:** Check the payment status of an order.
- **Authentication:** `protect`

### `POST /api/payments/wallet/pay`

- **Description:** Pay for an order using the wallet balance.
- **Authentication:** `protect`
- **Body:** `{ "orderId": "string" }`

---

## System

These endpoints are for internal system use.

### `POST /api/system/wallet/charge`

- **Description:** Charges a user's wallet for an order. (Internal)
- **Authentication:** `protect`, `admin`

### `POST /api/system/wallet/refund`

- **Description:** Refunds a user's wallet for an order. (Internal)
- **Authentication:** `protect`, `admin`

### `POST /api/system/payment/validate`

- **Description:** Validates a payment before processing. (Internal)
- **Authentication:** `protect`, `admin`
