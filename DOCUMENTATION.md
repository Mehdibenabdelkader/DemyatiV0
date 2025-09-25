# Demyati Game - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Detailed File Analysis](#detailed-file-analysis)
5. [Data Flow](#data-flow)
6. [API Documentation](#api-documentation)
7. [Socket.IO Events](#socketio-events)
8. [Game Mechanics](#game-mechanics)
9. [Setup and Installation](#setup-and-installation)
10. [Development Workflow](#development-workflow)
11. [Troubleshooting](#troubleshooting)

## Project Overview

**Demyati** is a multiplayer board game application built with modern web technologies. The game features a 200-tile board where players move based on dice rolls, with prime-numbered tiles highlighted for visual interest. The application supports real-time multiplayer gameplay through WebSocket connections.

### Key Features
- **Real-time Multiplayer**: Up to 6 players can join a single game room
- **Room Management**: Players can create or join rooms using 4-digit codes
- **Live Synchronization**: All game state changes are synchronized in real-time
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Socket.IO
- **Real-time Communication**: WebSocket via Socket.IO
- **State Management**: React hooks and local state
- **Styling**: CSS-in-JS with Tailwind CSS

## Architecture

The application follows a client-server architecture with the following components:

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │ ◄─────────────────► │   Backend       │
│   (Next.js)     │                      │   (Express.js)  │
│                 │                      │                 │
│ • Main Menu     │                      │ • Room API      │
│ • Game Lobby    │                      │ • Socket.IO     │
│ • Game Board    │                      │ • State Store   │
│ • Components    │                      │                 │
└─────────────────┘                      └─────────────────┘
```

### Frontend Architecture
- **Pages**: Next.js App Router with dynamic routes
- **Components**: Reusable React components with TypeScript
- **State Management**: React hooks for local state
- **Real-time Updates**: Socket.IO client for live synchronization
- **Routing**: Next.js routing with dynamic segments

### Backend Architecture
- **API Server**: Express.js with REST endpoints
- **WebSocket Server**: Socket.IO for real-time communication
- **State Storage**: In-memory storage (no database)
- **CORS**: Configured for cross-origin requests
- **TypeScript**: Full type safety throughout

## File Structure

```
v2/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   └── types.ts        # Backend types and utilities
│   ├── dist/               # Compiled JavaScript
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── frontend/               # Frontend application
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── game/
│   │       ├── create/
│   │       │   └── page.tsx # Room creation page
│   │       └── [roomCode]/
│   │           └── page.tsx # Game room page
│   ├── components/         # React components
│   │   ├── MainMenu.tsx    # Main menu component
│   │   ├── Game.tsx        # Game component
│   │   └── Lobby.tsx       # Lobby component
│   ├── lib/                # Utility libraries
│   │   ├── rooms.ts        # Room management functions
│   │   └── shared.ts       # Shared utilities
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── shared/                 # Shared code between frontend and backend
│   ├── types.ts            # Shared TypeScript types
│   ├── constants.ts        # Shared constants
│   ├── utils.ts            # Shared utility functions
│   └── index.ts            # Shared module exports
└── README.md               # Project documentation
```

## Detailed File Analysis

### Backend Files

#### `backend/src/index.ts`
**Purpose**: Main backend server file that handles HTTP API and WebSocket communication.

**Key Components**:
- **Express Server**: Handles HTTP requests for room management
- **Socket.IO Server**: Manages real-time WebSocket connections
- **Room Storage**: In-memory storage for game rooms
- **CORS Configuration**: Allows cross-origin requests from frontend

**HTTP Endpoints**:
- `GET /rooms` - Returns all available rooms
- `GET /rooms/:code` - Returns specific room by code
- `POST /rooms` - Creates a new room

**Socket.IO Events**:
- `rooms:list` - Request list of all rooms
- `rooms:create` - Create a new room
- `rooms:join` - Join an existing room
- `rooms:leave` - Leave a room
- `rooms:updatePlayer` - Update player information
- `rooms:start` - Start the game
- `rooms:update` - Broadcast room updates

**Data Flow**:
1. Client connects via WebSocket
2. Server validates player data
3. Server updates room state
4. Server broadcasts changes to all clients
5. Clients receive updates and sync local state

#### `backend/src/types.ts`
**Purpose**: Contains all TypeScript types, constants, and utility functions for the backend.

**Key Exports**:
- **Interfaces**: Player, Room, SocketEvents
- **Constants**: Server configuration, game rules, event names
- **Utilities**: Validation, sanitization, ID generation functions

### Frontend Files

#### `frontend/app/layout.tsx`
**Purpose**: Root layout component that wraps all pages in the application.

**Key Features**:
- **Font Configuration**: Geist Sans and Geist Mono fonts
- **Global Styles**: Applies CSS variables and base styles
- **HTML Structure**: Provides basic HTML structure for all pages

#### `frontend/app/page.tsx`
**Purpose**: Home page that renders the main menu component.

**Functionality**:
- Renders the MainMenu component
- Serves as the entry point for the application

#### `frontend/app/game/create/page.tsx`
**Purpose**: Handles automatic room creation and redirection.

**Process Flow**:
1. Retrieves nickname from URL params or session storage
2. Generates unique player ID
3. Creates room via backend API
4. Redirects to game room page
5. Handles errors and loading states

#### `frontend/app/game/[roomCode]/page.tsx`
**Purpose**: Main game room page that handles room validation and player joining.

**Key Features**:
- **Room Validation**: Checks if room exists and is accessible
- **Player Joining**: Automatically joins player to room if not already present
- **State Management**: Manages loading, error, and validation states
- **Game Rendering**: Renders appropriate game interface based on state

#### `frontend/components/MainMenu.tsx`
**Purpose**: Main menu component that provides the initial user interface.

**Key Features**:
- **Nickname Input**: Validates and stores player nickname
- **Host Button**: Creates new room and navigates to creation flow
- **Join Button**: Prompts for room code and navigates to game room
- **Validation**: Provides user feedback for invalid inputs
- **Session Storage**: Manages player data across page navigations

#### `frontend/components/Game.tsx`
**Purpose**: Main game component that handles both lobby and gameplay states.

**Key Features**:
- **State Management**: Manages game state, players, and room data
- **Real-time Sync**: Subscribes to room updates via WebSocket
- **Game Board**: Renders 200-tile board with player positions
- **Dice Rolling**: Handles dice rolls and player movement
- **Prime Highlighting**: Highlights prime-numbered tiles
- **Player Management**: Displays player list and current positions

#### `frontend/components/Lobby.tsx`
**Purpose**: Lobby component that handles pre-game room management.

**Key Features**:
- **Player List**: Displays all players in the room
- **Ready System**: Players can mark themselves as ready
- **Color Selection**: Players can choose their game piece color
- **Host Controls**: Host can start the game when all players are ready
- **Room Code Display**: Shows room code for sharing with other players

### Shared Files

#### `shared/types.ts`
**Purpose**: Contains all TypeScript interfaces and types shared between frontend and backend.

**Key Interfaces**:
- **Player**: Represents a game player with all properties
- **Room**: Represents a game room with players and state
- **SocketEvents**: Defines all WebSocket event types
- **API Responses**: Standardized response formats

#### `shared/constants.ts`
**Purpose**: Contains all constant values shared between frontend and backend.

**Key Constants**:
- **Server Configuration**: Port numbers and URLs
- **Game Rules**: Player limits, board size, dice ranges
- **Color Palette**: Available player colors
- **Event Names**: Socket.IO event constants

#### `shared/utils.ts`
**Purpose**: Contains utility functions shared between frontend and backend.

**Key Functions**:
- **ID Generation**: Room codes and player IDs
- **Validation**: Player and room data validation
- **Sanitization**: Data cleaning and normalization
- **Color Selection**: Random color selection from palette

## Data Flow

### Room Creation Flow
1. **User Input**: Player enters nickname in main menu
2. **Navigation**: User clicks "Host a room" button
3. **Data Storage**: Nickname stored in session storage
4. **Page Navigation**: Redirected to `/game/create` page
5. **Room Creation**: Backend API creates new room with host player
6. **Room Code Generation**: 4-digit room code generated
7. **Redirection**: User redirected to `/game/[roomCode]` page
8. **Room Validation**: Page validates room exists and player is host
9. **Lobby Rendering**: Lobby component rendered with room data

### Room Joining Flow
1. **User Input**: Player enters nickname in main menu
2. **Room Code Prompt**: User clicks "Join a room" and enters room code
3. **Data Storage**: Nickname and player ID stored in session storage
4. **Page Navigation**: Redirected to `/game/[roomCode]` page
5. **Room Validation**: Page validates room exists
6. **Player Joining**: Player automatically joined to room via WebSocket
7. **Lobby Rendering**: Lobby component rendered with room data

### Game Start Flow
1. **Player Readiness**: All players mark themselves as ready
2. **Host Action**: Host clicks "Start game" button
3. **WebSocket Event**: `rooms:start` event sent to backend
4. **State Update**: Backend sets `room.started = true`
5. **Broadcast**: Update broadcast to all connected clients
6. **Game Rendering**: Game component renders game board
7. **Player Positions**: All players start at tile 1

### Real-time Synchronization
1. **WebSocket Connection**: Client connects to backend via Socket.IO
2. **Event Subscription**: Client subscribes to `rooms:update` events
3. **State Changes**: Any room state change triggers update
4. **Broadcast**: Backend broadcasts update to all connected clients
5. **Local Sync**: Clients receive update and sync local state
6. **UI Update**: React components re-render with new state

## API Documentation

### HTTP Endpoints

#### GET /rooms
**Description**: Returns all available rooms
**Response**: `Record<string, Room>`
**Example**:
```json
{
  "1234": {
    "code": "1234",
    "players": [...],
    "started": false,
    "hostId": "abc123"
  }
}
```

#### GET /rooms/:code
**Description**: Returns specific room by code
**Parameters**: `code` - 4-digit room code
**Response**: `Room` or 404 error
**Example**:
```json
{
  "code": "1234",
  "players": [
    {
      "id": "abc123",
      "name": "Player1",
      "color": "#ef4444",
      "ready": true,
      "tile": 1,
      "isHost": true
    }
  ],
  "started": false,
  "hostId": "abc123"
}
```

#### POST /rooms
**Description**: Creates a new room
**Request Body**: `{ host: Player }`
**Response**: `Room` (201 status)
**Example Request**:
```json
{
  "host": {
    "id": "abc123",
    "name": "Player1",
    "color": "#ef4444",
    "ready": false,
    "isHost": true
  }
}
```

## Socket.IO Events

### Client to Server Events

#### rooms:list
**Description**: Request list of all rooms
**Parameters**: None
**Response**: `rooms:update` event with all rooms

#### rooms:create
**Description**: Create a new room
**Parameters**: `(host: Player, callback: (error, room) => void)`
**Response**: Callback with room data or error

#### rooms:join
**Description**: Join an existing room
**Parameters**: `(code: string, player: Player, callback: (error, room) => void)`
**Response**: Callback with room data or error

#### rooms:leave
**Description**: Leave a room
**Parameters**: `(code: string, playerId: string, callback: (error, result) => void)`
**Response**: Callback with success status

#### rooms:updatePlayer
**Description**: Update player information
**Parameters**: `(code: string, player: Player, callback: (error, room) => void)`
**Response**: Callback with updated room data

#### rooms:start
**Description**: Start the game
**Parameters**: `(code: string, callback: (error, room) => void)`
**Response**: Callback with updated room data

### Server to Client Events

#### rooms:update
**Description**: Broadcast room updates to all clients
**Parameters**: `(rooms: Record<string, Room>)`
**Triggered**: When any room state changes

## Game Mechanics

### Board Layout
- **Total Tiles**: 200 tiles numbered 1-200
- **Starting Position**: All players start at tile 1
- **Prime Tiles**: Prime-numbered tiles are highlighted in yellow
- **Player Pieces**: Colored circles representing each player
- **Tile Display**: Each tile shows its number and any player pieces on it

### Dice System
- **Dice Count**: Two dice (simulated)
- **Roll Range**: 2-12 (sum of two dice)
- **Movement**: Players move forward by the dice roll amount
- **Turn System**: Players take turns rolling dice
- **Winning**: First player to reach tile 200 wins

### Player Management
- **Maximum Players**: 6 players per room
- **Minimum Players**: 2 players required to start
- **Player Colors**: 6 predefined colors to choose from
- **Ready System**: Players must mark themselves as ready
- **Host Privileges**: Host can start the game

### Room Management
- **Room Codes**: 4-digit numeric codes (1000-9999)
- **Room Lifecycle**: Rooms persist until host leaves and no players remain
- **Player Joining**: Players can join anytime before game starts
- **Real-time Updates**: All changes synchronized instantly

## Setup and Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Backend will be available at `http://localhost:4000`

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Frontend will be available at `http://localhost:3000`

### Production Build
1. Build backend:
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. Build frontend:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## Development Workflow

### Adding New Features
1. **Backend Changes**: Modify `backend/src/index.ts` for API changes
2. **Frontend Changes**: Modify components in `frontend/components/`
3. **Shared Types**: Update `shared/types.ts` for new data structures
4. **Testing**: Test locally with multiple browser tabs
5. **Documentation**: Update this documentation file

### Code Organization
- **Components**: Keep components focused and reusable
- **State Management**: Use React hooks for local state
- **Type Safety**: Maintain TypeScript types throughout
- **Error Handling**: Provide user-friendly error messages
- **Real-time Updates**: Use WebSocket for live synchronization

### Best Practices
- **Validation**: Validate all user inputs
- **Error Handling**: Handle network errors gracefully
- **Performance**: Use React.memo for expensive components
- **Accessibility**: Include proper ARIA labels
- **Responsive Design**: Ensure mobile compatibility

## Troubleshooting

### Common Issues

#### Backend Connection Errors
**Problem**: Frontend cannot connect to backend
**Solution**: 
- Ensure backend is running on port 4000
- Check CORS configuration
- Verify network connectivity

#### Room Not Found Errors
**Problem**: Room code returns 404 error
**Solution**:
- Verify room code is correct
- Check if room still exists
- Ensure backend is running

#### WebSocket Connection Issues
**Problem**: Real-time updates not working
**Solution**:
- Check Socket.IO connection status
- Verify WebSocket support in browser
- Check network firewall settings

#### Player Sync Issues
**Problem**: Players not appearing in room
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify player ID is valid

### Debug Information
- **Backend Logs**: Check console output for server errors
- **Frontend Logs**: Check browser console for client errors
- **Network Tab**: Monitor HTTP and WebSocket requests
- **React DevTools**: Inspect component state and props

### Performance Optimization
- **Bundle Size**: Use dynamic imports for large components
- **Memory Usage**: Clean up event listeners and subscriptions
- **Network Requests**: Minimize API calls and WebSocket events
- **Rendering**: Use React.memo for expensive components

---

This documentation provides a comprehensive overview of the Demyati game application. For specific implementation details, refer to the individual file comments and code examples throughout the codebase.
