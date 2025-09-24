import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

// Server erstellen mit Logging
const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true
      }
    }
  }
});

// Plugins registrieren
async function registerPlugins() {
  // CORS für Mobile App
  await server.register(cors, {
    origin: true,
    credentials: true
  });

  // Security Headers
  await server.register(helmet, {
    contentSecurityPolicy: false
  });
}

// Routes definieren
async function defineRoutes() {
  // Health Check
  server.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  });

  // Welcome Route
  server.get('/', async (request, reply) => {
    return {
      message: 'Instagram Tracker API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login'
        }
      }
    };
  });
}

// Server starten
async function start() {
  try {
    // Plugins registrieren
    await registerPlugins();
    
    // Routes definieren
    await defineRoutes();

    // Port aus Umgebungsvariable oder 3000
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = '0.0.0.0';

    // Server starten
    await server.listen({ port, host });
    
    console.log(`🚀 Server läuft auf http://localhost:${port}`);
    console.log(`📋 Health check: http://localhost:${port}/health`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

// Start ausführen
start();
