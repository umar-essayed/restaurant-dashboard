# Z-SPEED Vendor API Documentation

This document contains all the endpoints available for the Vendor (Restaurant Owner) in the Z-SPEED system.

## Base URL
`http://localhost:3000/api/v1` (Default development URL)

## Authentication

All vendor requests (except login/register) require a Bearer Token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

### 1. Login (Email/Password)
- **URL**: `/auth/email/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "vendor@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Returns access token and refresh token.

### 2. Register (Email/Password)
- **URL**: `/auth/email/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "vendor@example.com",
    "password": "yourpassword",
    "name": "Vendor Name",
    "role": "VENDOR"
  }
  ```

### 3. Get Profile
- **URL**: `/auth/profile`
- **Method**: `GET`
- **Auth**: Required

---

## Restaurant Management

### 1. Get My Restaurants
- **URL**: `/vendor/restaurants/my`
- **Method**: `GET`
- **Auth**: Required (Role: VENDOR)

### 2. Create Restaurant
- **URL**: `/vendor/restaurants`
- **Method**: `POST`
- **Auth**: Required (Role: VENDOR)
- **Body**: `CreateRestaurantDto` (name, address, etc.)

### 3. Update Restaurant
- **URL**: `/vendor/restaurants/:id`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)
- **Body**: `UpdateRestaurantDto`

### 4. Update Delivery Settings
- **URL**: `/vendor/restaurants/:id/delivery-settings`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)
- **Body**: `DeliverySettingsDto` (deliveryRadiusKm, deliveryFee, etc.)

### 5. Toggle Restaurant Status (Open/Closed)
- **URL**: `/vendor/restaurants/:id/toggle-open`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)
- **Body**:
  ```json
  {
    "isOpen": true
  }
  ```

### 6. Get Restaurant Stats
- **URL**: `/vendor/restaurants/:id/stats`
- **Method**: `GET`
- **Auth**: Required (Role: VENDOR)

---

## Menu Management

### 1. Create Menu Section
- **URL**: `/vendor/menu-sections`
- **Method**: `POST`
- **Auth**: Required (Role: VENDOR)
- **Body**: `CreateMenuSectionDto` (name, restaurantId)

### 2. Update Menu Section
- **URL**: `/vendor/menu-sections/:id`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)

### 3. Delete Menu Section
- **URL**: `/vendor/menu-sections/:id`
- **Method**: `DELETE`
- **Auth**: Required (Role: VENDOR)

### 4. Create Food Item
- **URL**: `/vendor/food-items`
- **Method**: `POST`
- **Auth**: Required (Role: VENDOR)
- **Body**: `CreateFoodItemDto` (name, price, sectionId, etc.)

### 5. Update Food Item
- **URL**: `/vendor/food-items/:id`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)

### 6. Delete Food Item
- **URL**: `/vendor/food-items/:id`
- **Method**: `DELETE`
- **Auth**: Required (Role: VENDOR)

### 7. Toggle Food Availability
- **URL**: `/vendor/food-items/:id/availability`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)
- **Body**:
  ```json
  {
    "isAvailable": true
  }
  ```

---

## Order Management

### 1. Get Vendor Orders
- **URL**: `/vendor/orders`
- **Method**: `GET`
- **Query Params**: `restaurantId` (required), `status`, `page`, `limit`
- **Auth**: Required (Role: VENDOR)

### 2. Update Order Status
- **URL**: `/vendor/orders/:id/status`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)
- **Body**:
  ```json
  {
    "status": "PREPARING" // CONFIRMED, PREPARING, READY, etc.
  }
  ```

---

## Wallet & Finance

### 1. Get Wallet Ledger
- **URL**: `/wallet/ledger`
- **Method**: `GET`
- **Query Params**: `type`, `page`, `limit`
- **Auth**: Required (Role: VENDOR)

### 2. Request Payout
- **URL**: `/wallet/payout`
- **Method**: `POST`
- **Headers**: `idempotency-key`, `mfa-token`, `app-integrity`
- **Body**:
  ```json
  {
    "amount": 1000
  }
  ```

---

## Reviews

### 1. Reply to Review
- **URL**: `/reviews/:id/reply`
- **Method**: `PATCH`
- **Auth**: Required (Role: VENDOR)
- **Body**:
  ```json
  {
    "reply": "Thank you for your feedback!"
  }
  ```

---

## File Upload

### 1. Upload Image
- **URL**: `/upload`
- **Method**: `POST`
- **Auth**: Required
- **Form Data**: `file` (image), `folder` (optional)
- **Response**: `{ "url": "..." }`
