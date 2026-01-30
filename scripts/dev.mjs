import { createServer } from 'vite';

// Create and start Vite programmatically to avoid shell parsing issues with special characters in paths
const server = await createServer({
  configFile: './vite.config.ts',
});
await server.listen();
const port = server.config.server?.port ?? 5173;
console.log(`✅ Vite dev server running at http://localhost:${port}`);
