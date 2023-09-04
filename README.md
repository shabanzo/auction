# Auction

This is an auction application where the users can bid!

## Contents

1. [Getting Started](https://github.com/shabanzo/auction/blob/main/README.md#getting-started)
2. [Testing](https://github.com/shabanzo/auction/blob/main/README.md#testing)
   - [Test Category](https://github.com/shabanzo/auction/tree/main#test-category)
3. [Assumptions](https://github.com/shabanzo/auction/blob/main/README.md#assumptions)
4. [API Documentation](https://github.com/shabanzo/auction/blob/main/README.md#api-documentation)
   - [Users](https://github.com/shabanzo/auction/blob/main/README.md#users)
   - [Items](https://github.com/shabanzo/auction/blob/main/README.md#items)
   - [Bids](https://github.com/shabanzo/auction/blob/main/README.md#bids)
5. [Technical Documentation](https://github.com/shabanzo/auction/blob/main/README.md#api-documentation)

## Getting Started

### Using Docker

1. Make sure you have Docker installed on your machine.
2. Run the backend application inside `backend` directory using:

```
docker-compose up -d backend
```

3. Build the frontend image, inside `frontend` directory using:

```
docker build -t frontend .
```

4. Run the frontend application, inside `frontend` directory using:

```
docker run --name frontend -p 3000:3000 frontend
```

## Testing

### Using Docker

#### Run tests for backend

1. Make sure you have Docker installed on your machine.
2. Go inside `backend` directory and run the container with:

```
docker run -it --rm backend-backend /bin/sh
```

3. Run tests with:

```
npm install
```

### Test Category

1. Unit Test: For services, processors and repositories, testing different contexts within the services.
2. Integration Test: For controllers, testing the end-to-end process from the controller to the db.

## API Documentation

### Users

#### Users - Signup

- **URL:** `/api/v1/user/signup`
- **Method:** POST
- **Description:** Create a new user
- **Request Body:**
  - Content-Type: `application/json`
  - Schema:
    - `UserSignupDto`
- **Responses:**
  - 201: User created successfully
  - 409: The email already exists

#### Users - Signin

- **URL:** `/api/v1/user/signin`
- **Method:** POST
- **Description:** Authenticate a user
- **Request Body:**
  - Content-Type: `application/json`
  - Schema:
    - `UserSigninDto`
- **Responses:**
  - 200: User authenticated successfully
  - 401: Incorrect username or password

#### Users - My Profile

- **URL:** `/api/v1/user/myProfile`
- **Method:** GET
- **Description:** Get user profile
- **Security:** Bearer Token
- **Responses:**
  - 200: Ok
  - 401: You are not authorized

#### Users - Deposit

- **URL:** `/api/v1/user/deposit`
- **Method:** POST
- **Description:** Deposit funds to user's wallet
- **Security:** Bearer Token
- **Request Body:**
  - Content-Type: `application/json`
  - Schema:
    - `UserDepositDto`
- **Responses:**
  - 200: Deposit successful
  - 401: You are not authorized

### Items

#### Items - Get My Items

- **URL:** `/api/v1/items/mine`
- **Method:** GET
- **Description:** Get items belonging to the user
- **Parameters:**
  - `page` (query, required, type: number)
  - `limit` (query, required, type: number)
- **Security:** Bearer Token
- **Responses:**
  - 200: Ok

#### Items - Auction Items

- **URL:** `/api/v1/items/auction`
- **Method:** GET
- **Description:** Get auction items
- **Parameters:**
  - `page` (query, required, type: number)
  - `limit` (query, required, type: number)
  - `completed` (query, required, type: boolean)
- **Security:** Bearer Token
- **Responses:**
  - 200: Ok

#### Items - Create Item

- **URL:** `/api/v1/items`
- **Method:** POST
- **Description:** Create a new item
- **Security:** Bearer Token
- **Request Body:**
  - Content-Type: `application/json`
  - Schema:
    - `ItemCreateDto`
- **Responses:**
  - 201: Item created successfully

#### Items - Publish Item

- **URL:** `/api/v1/items/{id}/publish`
- **Method:** POST
- **Description:** Publish an item
- **Parameters:**
  - `id` (path, required, type: number)
- **Security:** Bearer Token
- **Request Body:**
  - Content-Type: `application/json`
  - Schema:
    - `ItemPublishDto`
- **Responses:**
  - 200: Item published successfully
  - 404: Item is not found

### Bids

#### Bids - Create Bid

- **URL:** `/api/v1/bids`
- **Method:** POST
- **Description:** Create a new bid
- **Security:** Bearer Token
- **Request Body:**
  - Content-Type: `application/json`
  - Schema:
    - `BidCreateDto`
- **Responses:**
  - 201: Bid created successfully
  - 401: Incorrect username or password
  - 404: Item is not found

## Schemas

### UserSignupDto

- Type: object
- Properties:
  - `email` (string, example: "syaban@test.com", description: "It's mandatory to use a valid email format")
  - `password` (string, example: "Password!1", description: "Password must contain Minimum 8 and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number, and one special character")
- Required: email, password

### UserSigninDto

- Type: object
- Properties:
  - `email` (string, example: "syaban@test.com", description: "It's mandatory to use a valid email format")
  - `password` (string, example: "Password!1")
- Required: email, password

### UserDepositDto

- Type: object
- Properties:
  - `amount` (number, example: 500.00)
- Required: amount

### ItemCreateDto

- Type: object
- Properties:
  - `name` (string)
  - `startingPrice` (number)
  - `timeWindowHours` (number)
- Required: name, startingPrice, timeWindowHours

### ItemPublishDto

- Type: object
- Properties:
  - `publishedAt` (string)
- Required: publishedAt

### BidCreateDto

- Type: object
- Properties:
  - `itemId` (number)
  - `amount` (number)
- Required: itemId, amount

## Technical Documentation

### Features

1. Authentication
   Using JWT and store the token in cookie on the client side.
2. Deposit to our balance
3. Create a new item, and get the list of logged in user items
4. Publish an item
   After the item is published, the system will send a job to be executed later once the bid is finished.
   ![Flow Diagram](https://github.com/shabanzo/auction/blob/master/frontend/public/publish.png?raw=true)
5. Get the list of ongoing/completed items
  - Ongoing items query: Not mine and it's already published but not passed `publishedAt` + `timeWindowHours`
  - Completed items query: Not mine and it's already published but already passed `publishedAt` + `timeWindowHours`
  - Actually, we can add a status column with enum: `draft`, `published`, `completed`, then query it by using the status but the consideration is to make the column more efficient since there's no other status than that so we can just use `publishedAt` condition.

6. Bid item
  - Check the rate limit, once per 5s.
  - Check the item current price
  - Check the user balance
  ![Flow Diagram](https://github.com/shabanzo/auction/blob/master/frontend/public/bid.png?raw=true)

7. Cancel failed bids

### Technical Design

#### Database Consideration

MongoDB vs PostgreSQL

This application has simple entity relationships, so using MongoDB or PosrgreSQL won't differ much. But these are my considerations:

1. This appplication is related to money so PostgreSQL is a better choice because PostgreSQL is fully ACID compliant, and has audit trails.
2. This application has a lot of ambiguity in the future, I mean we haven't decided what's the next development, what's structure will be like. So to handle iterations that will have more tables and relations, PostgreSQL is better than MongoDB because later if the relations become complex we will have difficulties in the query.

The trade offs:

1. The scalability
   MongoDB has built-in sharding capabilities that means support horizontally upscale. And this bid functionallity will be helped a lot if we can horizontally upscale the db to handle a lot of bids. But this case can be handled if we're using Kubernetes.

#### ER Diagram

![ER Diagram](https://github.com/shabanzo/auction/blob/master/frontend/public/ER.png?raw=true)

#### Infrastructure Design

![ER Diagram](https://github.com/shabanzo/auction/blob/master/frontend/public/architecture.png?raw=true)

#### Upscaling Strategy

Strategy: The combination of both horizontal upscale and vertical upscale

Assuming we build the infrastructure using Kubernetes, and set autoscaling horizontally. So it could handle more bids. But since the other infrastructure resources will be impacted so we also need to vertically upscale them.

Impacted resources:

- Redis
- PostgreSQL
