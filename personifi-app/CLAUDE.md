# Claude Development Notes

## Code Quality Guidelines

### TypeScript Best Practices
- **Never use `any` type** - Always prefer `unknown` for error handling and use type assertions with proper interfaces
- Use proper error typing: `catch (error: unknown)` then cast to expected error shape
- Example: `const authError = error as { code?: string; message?: string };`

## Project Structure

### Authentication
- Auth logic centralized in `src/lib/AuthProvider.ts`
- Handles token expiration automatically with redirect to `/`
- Components should import `getAccessToken` directly from AuthProvider

## Development Commands
- Test command: `npm test`
- Lint command: `npm run lint`
- Build command: `npm run build`
- Dev server: `npm run dev`