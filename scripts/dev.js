import { createServer } from 'vite'

const server = await createServer({
  root: process.cwd(),
  server: { port: 3000 }
})

await server.listen()
server.printUrls()
console.log('✅ Vite dev server started programmatically')
