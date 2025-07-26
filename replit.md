# CrowdVision Stadium Monitoring System

## Overview

CrowdVision is a full-stack web application designed for real-time stadium crowd monitoring and management. The system provides video analytics with heatmap generation, gate capacity monitoring, intelligent chatbot assistance, and comprehensive security alerting capabilities. It's built as a modern React frontend with an Express.js backend, utilizing PostgreSQL for data persistence and AI-powered features for crowd analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
- **Frontend**: React 18 with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Build System**: ESBuild for production bundling, Vite for development

### Key Design Decisions
- **Monorepo approach**: Single repository containing client, server, and shared code for easier development and deployment
- **TypeScript throughout**: Ensures type safety across the entire stack
- **Shared schema**: Common database schemas and types between frontend and backend via the `/shared` directory
- **Real-time updates**: Polling-based approach using React Query for live data synchronization

## Key Components

### Frontend Architecture
- **React with shadcn/ui**: Modern component library built on Radix UI primitives
- **TailwindCSS**: Utility-first styling with custom design system (dark theme focused)
- **React Query**: Server state management with automatic caching and synchronization
- **Wouter**: Lightweight routing solution
- **Component Structure**:
  - `VideoUpload`: Handles video file uploads for crowd analysis
  - `HeatmapVideo`: Displays processed videos with crowd density overlays
  - `GateMonitor`: Real-time gate capacity monitoring with status indicators
  - `ChatInterface`: AI-powered chat assistant for system queries
  - `AnalyticsPanel`: Live analytics dashboard with capacity metrics
  - `SecurityAlert`: Alert system for capacity violations and security events

### Backend Architecture
- **Express.js**: RESTful API server with middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **File Upload**: Multer middleware for video file handling (500MB limit)
- **Services**:
  - **NLP Service**: OpenAI GPT-4o integration for intelligent chat responses
  - **Video Processor**: Simulated video analysis generating heatmap data
- **API Endpoints**:
  - `/api/videos/*`: Video upload and streaming endpoints
  - `/api/gates/*`: Gate management and monitoring
  - `/api/alerts/*`: Security alert system
  - `/api/chat/*`: AI chatbot interface
  - `/api/analytics/*`: Live analytics data

### Database Schema
Using Drizzle ORM with PostgreSQL-compatible schema:
- **users**: User authentication and management
- **videos**: Video metadata and processing status with heatmap data
- **gates**: Gate definitions with capacity limits and current counts
- **alerts**: Security alerts with severity levels and acknowledgment tracking
- **chatMessages**: Chat history with AI responses

## Data Flow

### Video Processing Pipeline
1. User uploads video via frontend form
2. Multer middleware validates and stores file
3. Background processing generates simulated heatmap data
4. Database updated with processing results
5. Frontend polls for updates and displays processed video with overlays

### Real-time Monitoring
1. Frontend components poll API endpoints at different intervals (3-5 seconds)
2. Gate status changes trigger alert generation
3. Chat interface provides natural language queries about system status
4. Analytics panel aggregates data across all gates for dashboard view

### AI Chat Integration
1. User sends natural language query
2. Backend fetches current gate data
3. OpenAI GPT-4o processes query with system context
4. Response includes relevant data and actionable insights
5. Chat history persisted for context

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver (Neon-compatible)
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Comprehensive UI component primitives
- **multer**: File upload handling
- **openai**: GPT-4o API integration for AI chat features

### Development Tools
- **Vite**: Development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **tailwindcss**: Utility-first CSS framework

### Third-party Integrations
- **OpenAI API**: Powers the intelligent chat assistant with GPT-4o model
- **Replit Integration**: Development environment optimizations and error overlays

## Deployment Strategy

### Production Build Process
1. Frontend built with Vite to static assets in `dist/public`
2. Backend bundled with ESBuild to `dist/index.js`
3. Single Node.js process serves both API and static files
4. Environment variables required:
   - `DATABASE_URL`: PostgreSQL connection string
   - `OPENAI_API_KEY`: OpenAI API access for chat features

### Development Workflow
- **Hot reloading**: Vite middleware integrated with Express for seamless development
- **Type checking**: Shared TypeScript configuration across all packages
- **Database migrations**: Drizzle Kit for schema management with `db:push` command

### Infrastructure Requirements
- **Node.js runtime**: ES modules support required
- **PostgreSQL database**: Compatible with Neon serverless or traditional PostgreSQL
- **File storage**: Local filesystem for video uploads (can be extended to cloud storage)
- **Environment**: Designed for containerized deployment with configurable environment variables

The application is architected for scalability with clear separation of concerns, making it easy to enhance individual components or migrate to microservices if needed.