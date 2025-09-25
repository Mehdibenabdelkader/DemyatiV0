/**
 * SHARED MODULE INDEX
 * 
 * This is the main entry point for the shared module. It re-exports all
 * types, constants, and utility functions from the individual modules,
 * providing a single import point for shared functionality.
 * 
 * This allows other modules to import everything they need with a single
 * import statement: `import { Player, Room, generateRoomCode } from '../shared'`
 */

// Re-export all types and interfaces
export * from './types';

// Re-export all constants and configuration values
export * from './constants';

// Re-export all utility functions
export * from './utils';
