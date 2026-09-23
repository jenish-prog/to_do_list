# To-Do List Application

A full-stack task management application featuring a Node.js/Express TypeScript REST API and a React Native (Expo) mobile client.

## Project Structure

```
├── backend/    # Node.js + Express + TypeScript + MongoDB REST API
└── mobile/     # React Native + Expo + TypeScript mobile application
```

## Features

- **Authentication**: JWT-based user registration and login with secure password hashing.
- **Task Management**: Create, view, update, and delete tasks with priority levels, categories, and due dates.
- **Calendar & Timeline**: Organized task scheduling and calendar views.
- **Push Notifications**: Task reminders and alerts.
- **Cross-Platform**: Mobile app ready for Android and iOS.

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # configure your MONGO_URI and JWT_SECRET
npm run dev
```

### 2. Mobile App

```bash
cd mobile
npm install
npx expo start
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcryptjs
- **Mobile**: React Native, Expo, TypeScript, React Navigation, Axios, Lucide Icons
