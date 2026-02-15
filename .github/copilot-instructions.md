# GitHub Copilot Instructions for AI Agents

## Project Overview
This is a Node.js backend server using Express and Mongoose for MongoDB. The codebase is organized by domain, with controllers, models, and infrastructure separated for clarity and maintainability.

## Architecture & Major Components
- **Entry Point:** `server.js` starts the Express server and loads the main app from `app/app.js`.
- **App Structure:**
  - `app/controllers/`: Route handlers and business logic (e.g., `user.controller.js`).
  - `app/models/`: Mongoose schemas and models (e.g., `user.model.js`).
  - `app/infra/`: Infrastructure code, such as database connection (`db.js`).
  - `images/`: Static assets (if used).
- **Data Flow:**
  - HTTP requests are routed via Express to controllers, which interact with models for database operations.
  - Models use Mongoose schemas for validation and persistence.

## Developer Workflows
- **Start Server:**
  - Use `node server.js` or `npm start` (if defined in `package.json`).
- **Install Dependencies:**
  - Run `npm install` in the project root.
- **Environment Variables:**
  - Managed via `.env` and loaded with `dotenv`.
  - Example: `JWT_KEY` for authentication.
- **Debugging:**
  - Use VS Code or Node.js debuggers. Set breakpoints in controllers/models for business logic.

## Project-Specific Patterns & Conventions
- **User Authentication:**
  - JWT tokens are generated in the user model (`user.model.js`) via the `generateJWT` method.
  - Passwords are hashed using bcrypt in a Mongoose pre-save hook.
- **Model Usage:**
  - Always import models (e.g., `User`) in controllers, not schemas.
- **Validation:**
  - Mongoose schema validation is used for fields (e.g., email regex, password length).
- **Timestamps:**
  - All models use `{timestamps: true}` for automatic `createdAt`/`updatedAt` fields.

## Integration Points & External Dependencies
- **MongoDB:**
  - Connection managed in `app/infra/db.js`.
- **JWT & Bcrypt:**
  - Used for authentication and password security.
- **Dotenv:**
  - Loads environment variables from `.env`.

## Examples
- **Creating a User:**
  ```js
  import User from "../models/user.model.js";
  const newUser = await User.create({ name, email, password });
  ```
- **Authenticating a User:**
  ```js
  const token = user.generateJWT();
  ```

## Key Files
- `server.js`, `app/app.js`: Server and app initialization
- `app/controllers/user.controller.js`: User-related business logic
- `app/models/user.model.js`: User schema/model and authentication logic
- `app/infra/db.js`: Database connection

---

If any conventions or workflows are unclear, please provide feedback so this guide can be improved.