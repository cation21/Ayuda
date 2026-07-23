# Ayuda Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**Ayuda** is a transparent need & donation platform where verified individuals, NGOs, and companies can post their needs publicly, and donors can contribute with full visibility of every transaction. This repository contains the **frontend web application**, built with React, Vite, and Tailwind CSS.

> **Vision:** _"You don't have to trust the platform — you can see the money move."_

---

## Table of Contents

- [Ayuda Frontend](#ayuda-frontend)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
  - [Connecting to the Backend](#connecting-to-the-backend)
  - [Mobile App](#mobile-app)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)
  - [Contact](#contact)

---

## About the Project

Ayuda bridges the gap between social media and charitable giving by offering:

- **Public, tamper-evident transaction ledgers** on every donation post
- **Tiered verification** (Community-verified, Document-verified, Anonymous-but-verified) to build trust
- **Anonymous posting** for at-risk individuals in conflict zones or under political pressure
- **Proof of Use** — recipients upload receipts/photos once funds are raised, visible to all
- **Micro-donation interactions** — every comment/like requires a ₹1 donation, discouraging spam

This frontend consumes the [Ayuda Backend API](https://github.com/your-org/ayuda-backend) and provides a responsive, modern social-feed experience.

---

## Tech Stack

| Category         | Technology                                                                             |
| ---------------- | -------------------------------------------------------------------------------------- |
| Framework        | [React 18](https://reactjs.org/)                                                       |
| Build Tool       | [Vite 4](https://vitejs.dev/)                                                          |
| Styling          | [Tailwind CSS 3](https://tailwindcss.com/)                                             |
| Routing          | [React Router v6](https://reactrouter.com/)                                            |
| State Management | React Context + Hooks (for auth, socket, theme)                                        |
| HTTP Client      | [Axios](https://axios-http.com/)                                                       |
| Real-time        | [Socket.IO Client](https://socket.io/)                                                 |
| Forms            | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (validation) |
| Icons            | [Lucide React](https://lucide.dev/)                                                    |
| Environment      | `.env` with `VITE_` prefix                                                             |

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- A running instance of the [Ayuda Backend](https://github.com/your-org/ayuda-backend)
- MongoDB (for the backend)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/ayuda-frontend.git
   cd ayuda-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Fill in the required values — see [Environment Variables](#environment-variables).

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable            | Description                                  | Default                     |
| ------------------- | -------------------------------------------- | --------------------------- |
| `VITE_API_URL`      | Base URL of the backend API                  | `http://localhost:5000/api` |
| `VITE_SOCKET_URL`   | Socket.IO server URL (for real-time updates) | `http://localhost:5000`     |
| `VITE_RAZORPAY_KEY` | Razorpay key ID (for payment gateway)        | _(optional)_                |

> All variables must be prefixed with `VITE_` to be exposed to the client.

---

## Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images, fonts, etc.
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Button, Input, Modal, etc.
│   │   ├── layout/             # Navbar, Sidebar, Footer
│   │   ├── posts/              # PostCard, ProgressBar, ProofOfWork
│   │   ├── profiles/           # ProfileHeader, TrustPanel
│   │   └── donations/          # DonationModal, LedgerView
│   ├── pages/                  # Route pages
│   │   ├── HomePage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── PostDetailPage.jsx
│   │   ├── OrganizationPage.jsx
│   │   ├── CreatePostPage.jsx
│   │   └── AdminDashboard.jsx
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # Context providers (Auth, Socket)
│   ├── services/                # API service modules (Axios)
│   ├── utils/                  # Helper functions
│   ├── styles/                  # Tailwind imports / custom CSS
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── routes.jsx               # Route definitions
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── .env.example
```

---

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server                 |
| `npm run build`   | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Run ESLint                               |
| `npm run test`    | Run the test suite with Vitest           |

---

## Connecting to the Backend

The frontend expects the backend to provide:

- A REST API at `VITE_API_URL`
- A WebSocket (Socket.IO) endpoint at `VITE_SOCKET_URL`

Make sure the backend is running and CORS is configured to allow requests from the frontend origin (`http://localhost:5173` in development).

---

## Mobile App

A React Native / Expo mobile version is planned to share the same backend API. The `mobile/` folder (at the monorepo root) will contain that codebase in the future.

---

## Testing

We use [Vitest](https://vitest.dev/) for unit and component testing.

```bash
npm run test
```

---

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## Acknowledgements

- [Tailwind UI](https://tailwindui.com/) for design inspiration
- [Font Awesome](https://fontawesome.com/) for icons (used in earlier mockups)
- The open-source community for the tools that made this possible

---

## Contact

**Project Link:** [github.com/your-org/ayuda-frontend](https://github.com/your-org/ayuda-frontend)
**Backend Repo:** [github.com/your-org/ayuda-backend](https://github.com/your-org/ayuda-backend)

---

_Built with ❤️ for transparency and humanity._
