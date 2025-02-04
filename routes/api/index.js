// routes/api/index.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically load all route files in the current directory
const loadRoutes = async () => {
    const files = fs.readdirSync(__dirname).filter(file => file.endsWith('Router.js'));
    const imports = files.map(async (file) => {
      const route = await import(`./${file}`);
      const routePath = `/${file.replace('Router.js', '')}`; // Derive route path from file name
      router.use(routePath, route.default);
      console.log(`Loaded route: ${routePath}`)
    });
  
    await Promise.all(imports); // Wait for all imports to complete
};

// Ensure routes are loaded before exporting
loadRoutes().then(() => {
    console.log('Routes loaded successfully');
});

export default router;
