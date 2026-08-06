# 👕 SwapWear

<p align="center">
  <img src="https://raw.githubusercontent.com/SatyamKushwaha3232/SwapWear/main/frontend/public/logo.png" width="180" alt="SwapWear Logo"/>
</p>

<h1 align="center">♻️ SwapWear - Sustainable Fashion Marketplace</h1>

<p align="center">
A premium clothing swapping platform built using React, Node.js, Express, PostgreSQL and Prisma.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)

![Vite](https://img.shields.io/badge/Vite-Latest-purple?style=for-the-badge&logo=vite)

![NodeJS](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-blue?style=for-the-badge&logo=postgresql)

![Socket.io](https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socket.io)

![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

---

# 🌍 Live Website

### 🚀 https://swapwear-iota.vercel.app/

---

# 📖 About SwapWear

SwapWear is a modern fashion marketplace where users can exchange clothes instead of throwing them away.

Instead of buying new fashion every time, users can upload unused clothes, discover other products, send swap requests, chat with owners, and make sustainable fashion choices.

The platform is designed with a premium UI inspired by modern ecommerce applications while promoting eco-friendly shopping habits.

---

# ✨ Features

## 🔐 Authentication

- JWT Authentication
- Refresh Token Authentication
- Login
- Signup
- Forgot Password
- Reset Password
- Google Login
- GitHub Login
- Microsoft Login
- Phone OTP Login

---

## 👤 User Features

- User Dashboard
- Profile Management
- Avatar Upload
- Wishlist
- Settings
- Personal Listings

---

## 👕 Marketplace

- Upload Clothes
- Multiple Product Images
- Product Video
- Category Filter
- Size Filter
- Condition Filter
- Search
- Product Details
- Responsive Cards

---

## 🔄 Swapping

- Swap Requests
- Accept Request
- Reject Request
- Reserved Products
- Swap Deal Room
- Swap History

---

## 💬 Communication

- Real-time Chat
- Socket.IO
- Notifications
- Typing Indicator

---

## 👑 Admin

- Admin Dashboard
- Manage Users
- Manage Listings
- Manage Swaps
- Trust Management

---

## 🌱 Sustainability

- Eco Friendly Fashion
- Waste Reduction
- Circular Economy
- Clothes Reuse
- Carbon Footprint Reduction

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router DOM
- Context API
- React Hot Toast
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- Socket.IO
- Multer
- Cookie Parser
- Helmet
- Express Rate Limit

---

## Database

- PostgreSQL

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- PostgreSQL

---

# 📂 Project Structure

```text
SwapWear
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── lib
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── modules
│   │   ├── routes
│   │   ├── services
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

# 🚀 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Production Build

```bash
npm run build
```

---

## Frontend Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api

VITE_AUTH_PROVIDER=backend
```

---

# ⚙ Backend Setup

```bash
cd backend

npm install

npm run db:push

npm run db:generate

npm run admin:create

npm run dev
```

---

## Backend Environment Variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/swapwear

JWT_ACCESS_SECRET=change-me-access

JWT_REFRESH_SECRET=change-me-refresh

CLIENT_URL=http://localhost:5173

PORT=5000

OAUTH_CALLBACK_BASE_URL=http://localhost:5000/api/auth/oauth
```

---

# 🚀 One Command Local Setup

```bash
npm run setup

npm run db:push

npm run seed:demo

npm run admin:create

npm run dev
```

---

# 🔑 OAuth Callback URLs

Google

```
http://localhost:5000/api/auth/oauth/google/callback
```

GitHub

```
http://localhost:5000/api/auth/oauth/github/callback
```

Microsoft

```
http://localhost:5000/api/auth/oauth/microsoft/callback
```

---

# 🧪 Useful Commands

```bash
npm run smoke

npm run build

npm run qa
```

Frontend

```bash
cd frontend

npm run lint

npm run build
```

Backend

```bash
cd backend

npx prisma validate

npm run db:generate
```
---

# 📡 API Modules

SwapWear follows a modular backend architecture.

| Module | Description |
|---------|-------------|
| 🔐 Authentication | Login, Signup, JWT, Refresh Token, OAuth |
| 👤 Users | Profile, Avatar, Settings |
| 👕 Listings | Create, Update, Delete Products |
| ❤️ Wishlist | Save & Remove Favourite Products |
| 🔄 Swaps | Send & Manage Swap Requests |
| 💬 Chat | Real-time Messaging using Socket.IO |
| 🔔 Notifications | User Notifications |
| 🚚 Delivery | Shipping & Delivery Management |
| 💳 Payments | Payment Integration Layer |
| ⭐ Trust | User Trust Score |
| 👑 Admin | Admin Dashboard & Controls |

---

# 📱 Application Flow

```text
Visitor
   │
   ▼
Login / Signup
   │
   ▼
Dashboard
   │
   ├──────────────► Profile
   │
   ├──────────────► Wishlist
   │
   ├──────────────► Community
   │
   ├──────────────► Chat
   │
   ├──────────────► Add Listing
   │
   ├──────────────► Explore
   │                      │
   │                      ▼
   │              Product Details
   │                      │
   │                      ▼
   │               Send Swap Request
   │                      │
   ▼                      ▼
Swap Dashboard ◄──── Deal Room
```

---

# 🏗️ System Architecture

```text
                    React + Vite
                          │
                          │ REST API
                          ▼
                Express.js Backend
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
 PostgreSQL          Socket.IO        Cloudinary*
    Prisma           Realtime Chat      Images

*Cloudinary integration planned / recommended for production.
```

---

# 📸 Screenshots

> Replace these placeholders with screenshots of your application.

## 🏠 Home Page

```
Add Screenshot Here
```

---

## 🔍 Explore Page

```
Add Screenshot Here
```

---

## 👕 Product Details

```
Add Screenshot Here
```

---

## 👤 Dashboard

```
Add Screenshot Here
```

---

## 💬 Chat

```
Add Screenshot Here
```

---

## ❤️ Wishlist

```
Add Screenshot Here
```

---

## 👑 Admin Panel

```
Add Screenshot Here
```

---

# 🌱 Why SwapWear?

The fashion industry produces millions of tons of textile waste every year.

SwapWear helps reduce this by encouraging people to exchange clothes instead of throwing them away.

### Our Goals

- ♻️ Sustainable Fashion
- 🌍 Reduce Textile Waste
- 👕 Reuse Clothing
- 🌱 Eco-Friendly Marketplace
- 💚 Circular Economy

---

# 🚀 Upcoming Features

- ✅ Cloudinary Image Storage
- ✅ AI Outfit Recommendation
- ✅ AI Product Search
- ✅ QR Code Based Swaps
- ✅ AI Chatbot
- ✅ Stripe Payments
- ✅ Razorpay Integration
- ✅ PWA Support
- ✅ Mobile Application
- ✅ Dark Mode
- ✅ Product Analytics
- ✅ Seller Ratings
- ✅ Virtual Try-On

---

# ☁️ Deployment

## Frontend

- Vercel

## Backend

- Render

## Database

- PostgreSQL

---

# 📦 Production Notes

- Configure a production mail provider before enabling password reset emails.
- Store uploaded product images using **Cloudinary** or **AWS S3** instead of local storage.
- Configure payment gateway credentials before production deployment.
- Enable HTTPS for all services.
- Use PostgreSQL backups.
- Configure environment variables securely.
- Run complete QA testing before release.

---

# 🔐 Security Features

- JWT Authentication
- Refresh Token Authentication
- Password Encryption
- Helmet Security
- CORS Protection
- Rate Limiting
- Cookie Authentication
- Protected Routes
- Admin Route Protection

---

# 📈 Performance Optimizations

- React Lazy Loading
- Code Splitting
- Suspense Loading
- Optimized Images
- Protected API Requests
- Socket.IO Rooms
- Prisma ORM Optimization

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Developer

## Satyam Kushwaha

**Aspiring Software Engineer | Full Stack Developer | Cloud Enthusiast**

### 📧 Connect with Me

**GitHub**

https://github.com/SatyamKushwaha3232

**LinkedIn**

https://www.linkedin.com/in/satyamkushwaha3224/

---

# ⭐ If You Like This Project

Please consider supporting it by

⭐ Starring the repository

🍴 Forking the project

🛠️ Contributing

📢 Sharing with others

---

# 📜 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute it with proper attribution.

---

# 🙏 Acknowledgements

Special thanks to

- React Team
- Vite Team
- Express.js
- Prisma
- PostgreSQL
- Socket.IO
- Tailwind CSS
- Lucide Icons
- Open Source Community

---

<div align="center">

# 👕 SwapWear

### ♻️ Fashion that deserves a second chance.

### Built with ❤️ using

React • Node.js • Express • PostgreSQL • Prisma • Socket.IO

---

⭐ **If you found this project helpful, don't forget to Star the Repository!** ⭐

</div>
