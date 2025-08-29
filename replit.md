# Spanish Learning Game for Kids

## Overview

This is a fun, interactive Spanish learning application designed specifically for children. The app features multiple engaging game modes including flashcards, memory games, quizzes, and pronunciation exercises. It uses a colorful, child-friendly design with animated characters and gamification elements like scoring and progress tracking to make language learning enjoyable and motivating.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible components
- **Styling**: Tailwind CSS with custom color scheme (coral, mint, sunny, soft-white) optimized for children
- **Typography**: Custom font stack using child-friendly fonts (Nunito, Comic Neue, Fredoka One)
- **State Management**: TanStack Query for server state and React hooks for local state
- **Animations**: Framer Motion for smooth, playful animations and transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Development**: TSX for TypeScript execution in development mode
- **Build System**: ESBuild for production bundling with Vite for development
- **API Design**: RESTful endpoints for vocabulary, user progress, and game sessions
- **Storage Interface**: Abstract storage layer supporting both in-memory and database implementations

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon Database for production
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage with sample data for rapid development
- **Session Management**: PostgreSQL session store for user state persistence

### Authentication and Authorization
- **User Management**: Simple user ID system with default user for demo purposes
- **Session Handling**: Express sessions with PostgreSQL backing store
- **Data Isolation**: User-scoped data queries for progress tracking and statistics

### External Service Integrations
- **Audio Services**: Web Speech API for text-to-speech pronunciation
- **Speech Recognition**: Browser-native SpeechRecognition API for pronunciation games
- **Development Tools**: Replit-specific plugins for cartographer and runtime error overlay

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library
- **framer-motion**: Animation library for interactive UI elements

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management
- **lucide-react**: Icon library with consistent styling

### Database and Backend
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **express**: Web framework for API endpoints
- **connect-pg-simple**: PostgreSQL session store

### Development and Build Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Utility Libraries
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities
- **nanoid**: Unique ID generation
- **clsx/tailwind-merge**: Conditional CSS class management