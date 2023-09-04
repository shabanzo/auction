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
6. [How to Add A New Channel](https://github.com/shabanzo/auction/tree/main#how-to-add-a-new-channel)
7. [Additional Notes](https://github.com/shabanzo/auction/tree/main#additional-notes)

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

### ER Diagram

### Additional Notes

1. [::Reservations::Payload::Converter](https://github.com/shabanzo/auction/tree/main/app/services/reservations/payload/converter) - [Here](https://github.com/shabanzo/auction/blob/main/app/services/reservations/upsert.rb#L31-L35) utilizing [Factory Method (Design Pattern)](https://refactoring.guru/design-patterns/factory-method)
   - [::Reservations::Payload::Converter::Airbnb](https://github.com/shabanzo/auction/tree/main/app/services/reservations/payload/converter/airbnb) - Converts Airbnb payload to a standardized structure.
   - [::Reservations::Payload::Converter::Bookingcom](https://github.com/shabanzo/auction/tree/main/app/services/reservations/payload/converter/bookingcom) - Converts Bookingcom payload to a standardized structure.
2. [::Reservations::Update](https://github.com/shabanzo/auction/blob/main/app/services/reservations/update.rb) - Updates reservations and guests using Dry::Transactions. The transaction rolls back if any step fails, ensuring data consistency.
3. Modules, for example: [::Reservations module](https://github.com/shabanzo/auction/blob/main/app/services/reservations.rb) - Help organize common methods and namespace services based on their domain, such as Reservations.
4. `Dry::Monads` for handling response properly.

## How to add a new channel?

1. Add a new identifier on [::Reservations::Payload::Identifier](https://github.com/shabanzo/auction/blob/main/app/services/reservations/payload/identifier.rb)
2. Create a new converter under [::Reservations::Payload::Converter](https://github.com/shabanzo/auction/tree/main/app/services/reservations/payload/converter)
