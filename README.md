# Tasks API - Node.js + Express + PostgreSQL

A task management REST API built with built with **Node.js**, **Express**, **PostgreSQL**, and **JWT authentication**.
Includes **validation**, **custom error handling**, and **automated testing using Jest + Supertest**.

---

## Features

### Authentication
- User registration
- User login with JWT token
- Protected routes using bearer tokens

### Task Management
- Create a task
- Get all tasks (with pagination, filtering and sorting)
- Get a task by ID
- Update a task
- Delete a task

### Validation
- Custom `AppError` class  
- Middleware-based error handling  
- Title must be a string (3-100 chars)
- Status must be: `todo`, `in-progress`, or `done`
- Description optional (must be string if provided)

### Filtering, Sorting Pagination:
Examples:
- `GET /tasks?status=done`
- `GET /tasks?sort=createdAt&order=asc`
- `GET /tasks?page=2&limit=5`

---

## Tech Stack
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- Jest
- Supertest
- Nodemon (development auto-reload)

---

## Installation:

Clone the repo:

```
git clone https://github.com/LawrenceLee1999/tasks-api.git
cd tasks-api
npm install
```

---

## Environmental Variables

Create a `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tasks
JWT_SECRET=yourSecretKey
PORT=3000
```

Create `.env.test`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tasks_test
JWT_SECRET=testSecret
```

---
## Database Setup

Create your databases:

```
CREATE DATABASE tasks;
CREATE DATABASE tasks_test;
```

Run your schema:

```
psql -d tasks -f schema.sql
psql -d tasks_test -f schema.sql
```

---

## Running the Server

Start development server:

```
npm run dev
```

API runs at:

```
http://localhost:3000
```

---

## Running Tests

```
npm test
```

---

## API Endpoints

### Auth  
POST /auth/register  
POST /auth/login  

### Tasks  
POST /tasks  
GET /tasks  
GET /tasks/:id  
PUT /tasks/:id  
DELETE /tasks/:id  

---

## Project Structure

```
src/
  controllers/
  middleware/
  routes/
  utils/
  config/
tests/
index.js
schema.sql
```

---

## Future Improvements
- Priority levels for tasks  
- Due dates  
- Admin user system  
- Swagger documentation  
- Docker support  
