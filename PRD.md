# Product Requirements Document (PRD)

# MiniShop — E-Commerce REST API

**Version:** 1.0  
**Project Type:** Backend-only
**Estimated Duration:** 14–21 days  
**Status:** Planned

## 1. Project Overview

MiniShop is a RESTful backend service for a small online store.

Customers can register, log in, browse products, manage their carts, place orders, and view their purchase history.

Administrators can create products, update inventory, deactivate products, and manage customer orders.

The application will initially be tested using Postman. A frontend is not required.

### Project Goals

- Build a complete backend independently.
- Practice Express routing, middleware, and controllers.
- Understand MongoDB schema design and Mongoose.
- Implement secure authentication and authorization.
- Handle inventory consistency and concurrent orders.
- Write automated tests.
- Deploy and document the API.

## 2. Technology Stack

| Component        | Technology               |
| ---------------- | ------------------------ |
| Runtime          | Node.js                  |
| Framework        | Express.js               |
| Database         | MongoDB                  |
| ODM              | Mongoose                 |
| Authentication   | JWT                      |
| Password hashing | bcrypt                   |
| Validation       | Zod or express-validator |
| API testing      | Postman                  |
| Automated tests  | Vitest/Jest + Supertest  |
| Deployment       | Node.js hosting provider |

## 3. User Roles

### Customer

- Register and log in.
- View and search products.
- Manage shopping cart.
- Place orders.
- View order history.
- Cancel eligible orders.

### Administrator

- Log in.
- Create, edit, and deactivate products.
- Update inventory.
- View all orders.
- Update order statuses.

Customers must never be allowed to assign themselves administrator privileges.

## 4. Functional Requirements

### FR-01: Authentication

**Endpoints**

| Method | Endpoint                  | Access        |
| ------ | ------------------------- | ------------- |
| POST   | `/api/auth/register`      | Public        |
| POST   | `/api/auth/login`         | Public        |
| POST   | `/api/auth/refresh-token` | Refresh token |
| POST   | `/api/auth/logout`        | Authenticated |

**Requirements**

- Unique email registration.
- Password hashing before storage.
- Login with email and password.
- Short-lived JWT access tokens.
- Refresh-token validation and revocation.
- Role-based authorization.
- Proper HTTP status codes.
- No passwords or authentication secrets in public responses.

### FR-02: Product Management

**Endpoints**

| Method | Endpoint            | Access |
| ------ | ------------------- | ------ |
| POST   | `/api/products`     | Admin  |
| GET    | `/api/products`     | Public |
| GET    | `/api/products/:id` | Public |
| PATCH  | `/api/products/:id` | Admin  |
| DELETE | `/api/products/:id` | Admin  |

**Product Fields**

- `name`: required string
- `description`: optional string
- `price`: positive integer (BDT)
- `stock`: nonnegative integer
- `category`: required string
- `isActive`: boolean
- `createdAt`, `updatedAt`: timestamps

**Requirements**

- Validate all product inputs.
- Support pagination, filtering, sorting, and name search.
- Hide inactive products from customer listings.
- Use soft deletion by setting `isActive = false`.
- Only admins may change price, stock, or product availability.

### FR-03: Shopping Cart

**Endpoints**

| Method | Endpoint                     | Access   |
| ------ | ---------------------------- | -------- |
| GET    | `/api/cart`                  | Customer |
| POST   | `/api/cart/items`            | Customer |
| PATCH  | `/api/cart/items/:productId` | Customer |
| DELETE | `/api/cart/items/:productId` | Customer |

**Requirements**

- Each customer has their own cart.
- Customers can add, update, and remove products.
- Quantities must be positive integers.
- Adding an existing product increases its quantity.
- Cart totals are calculated on the backend.
- Cart items do not reserve stock.
- Stock and current prices must be revalidated at checkout.

### FR-04: Order Placement

**Endpoint:** `POST /api/orders`

**Requirements**

- Only authenticated customers can place orders.
- Empty carts cannot be checked out.
- Products must exist and be active.
- Orders cannot exceed available stock.
- Prices must be calculated using trusted database values.
- Stock must be reduced atomically.
- Multi-product checkout must use a MongoDB transaction.
- Purchased cart items must be cleared after successful checkout.
- Failed transactions must not leave partial orders.
- Repeated checkout requests with the same idempotency key must not create duplicate orders.

### FR-05: Order History

**Endpoints**

| Method | Endpoint            | Access      |
| ------ | ------------------- | ----------- |
| GET    | `/api/orders/my`    | Customer    |
| GET    | `/api/orders/:id`   | Owner/Admin |
| GET    | `/api/admin/orders` | Admin       |

**Requirements**

- Customers can only access their own orders.
- Admins can view all orders.
- Each order stores purchased product names, quantities, and unit-price snapshots.
- Historical order totals must remain unchanged if product prices change.

### FR-06: Order Status and Cancellation

**Endpoints**

| Method | Endpoint                       | Access |
| ------ | ------------------------------ | ------ |
| PATCH  | `/api/admin/orders/:id/status` | Admin  |
| POST   | `/api/orders/:id/cancel`       | Owner  |

**Order statuses**

- `PLACED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

**Requirements**

- Only valid status transitions are allowed.
- Customers may cancel orders only in `PLACED` status.
- Cancellation must restore inventory exactly once.
- Repeated cancellation must not increase inventory again.
- Inventory restoration and status changes must be coordinated atomically.

## 5. Database Models

### User

- `_id`
- `name`
- `email`
- `password`
- `role`
- `refreshToken` or session reference
- `createdAt`
- `updatedAt`

### Product

- `_id`
- `name`
- `description`
- `price`
- `stock`
- `category`
- `isActive`
- `createdAt`
- `updatedAt`

### Cart

- `_id`
- `user` — reference to User
- `items` — array of product IDs and quantities
- `updatedAt`

### Order

- `_id`
- `user` — reference to User
- `items` — product snapshots
- `totalAmount`
- `status`
- `idempotencyKey`
- `createdAt`
- `updatedAt`

## 6. Non-Functional Requirements

### Security

- Validate and sanitize incoming inputs.
- Hash passwords securely.
- Protect private endpoints.
- Enforce role-based authorization.
- Apply rate limiting to authentication endpoints.
- Use secure cookie settings for browser-based authentication.
- Protect cookie-authenticated state-changing requests against CSRF.
- Never expose passwords, signing secrets, or internal stack traces.

### Reliability

- Centralized error handling.
- Consistent response structures.
- Appropriate HTTP status codes.
- Atomic inventory updates.
- Transactions for multi-document operations.
- Duplicate-order prevention.

### Performance

- Paginate product and order listings.
- Use appropriate database indexes.
- Set maximum page-size limits.
- Avoid unnecessary database queries.

## 7. Standard API Responses

**Success**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "PRODUCT_ID",
    "name": "Keyboard",
    "price": 2500
  }
}
```

**Failure**

```json
{
  "success": false,
  "message": "Insufficient stock",
  "errors": []
}
```

## 8. Testing Requirements

The following scenarios must be tested:

- Registration with duplicate email.
- Login with incorrect credentials.
- Unauthorized access to private endpoints.
- Customer attempting admin operations.
- Invalid product price or stock.
- Adding nonexistent products to cart.
- Ordering more products than available.
- Two customers purchasing the last available item.
- Multi-product checkout failure and rollback.
- Duplicate checkout submissions.
- Accessing another customer's order.
- Cancelling an ineligible order.
- Repeated cancellation without duplicate inventory restoration.

## 9. Development Milestones

| Milestone | Target     | Deliverable                            |
| --------- | ---------- | -------------------------------------- |
| M1        | Days 1–3   | Project setup and Product CRUD         |
| M2        | Days 4–6   | Authentication and authorization       |
| M3        | Days 7–9   | Shopping cart and basic orders         |
| M4        | Days 10–13 | Inventory concurrency and transactions |
| M5        | Days 14–17 | Order lifecycle and automated testing  |
| M6        | Days 18–21 | Deployment and documentation           |

## 10. Out of Scope

The following features are excluded from Version 1:

- Frontend development
- Payment gateway
- Product image uploads
- Coupons and discounts
- Shipping integrations
- Real-time notifications
- Microservices
- Redis caching
- Kubernetes

## 11. Definition of Done

The project is considered complete when:

- All required REST endpoints work.
- Authentication and authorization are enforced.
- MongoDB stores products, carts, and orders correctly.
- Concurrent purchases cannot oversell inventory.
- Failed checkouts do not leave partial orders.
- Duplicate checkout requests are handled safely.
- Important success and failure cases are covered by automated tests.
- The API is deployed.
- Setup instructions and API documentation are available.
- The developer can explain and debug the implementation independently.
