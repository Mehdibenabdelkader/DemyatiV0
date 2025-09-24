# Shared Module

This folder contains shared types, constants, and utilities used by both the frontend and backend applications.

## Structure

- `types.ts` - TypeScript interfaces and types shared between frontend and backend
- `constants.ts` - Shared constants like colors, configuration values, and API endpoints
- `utils.ts` - Shared utility functions for common operations
- `index.ts` - Main export file that re-exports all shared modules

## Usage

Both frontend and backend can import from this shared module:

```typescript
import { Player, Room, generatePlayerId, PLAYER_COLORS } from '../shared';
```

## Benefits

- **Type Safety**: Ensures frontend and backend use the same data structures
- **DRY Principle**: Eliminates duplicate type definitions and utilities
- **Consistency**: Maintains consistent naming and structure across the application
- **Maintainability**: Changes to shared types automatically propagate to both sides
