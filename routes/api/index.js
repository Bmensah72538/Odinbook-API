import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically load all route files in the current directory
const loadRoutes = async () => {
    const files = fs.readdirSync(__dirname).filter(file => file.endsWith('Routes.js'));
  
    const imports = files.map(async (file) => {
      const route = await import(`./${file}`);
      const routePath = `/${file.replace('Routes.js', '')}`; // Derive route path from file name
      router.use(routePath, route.default);
    });
  
    await Promise.all(imports); // Wait for all imports to complete
  };
  
  await loadRoutes(); // Ensure routes are loaded before exporting
  
  export default router;