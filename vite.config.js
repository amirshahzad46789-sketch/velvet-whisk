import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import fs from 'fs';
import path from 'path';

function localDBPlugin() {
  return {
    name: 'local-db-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle GET /api/data
        if (req.method === 'GET' && req.url === '/api/data') {
          const dbPath = path.resolve('src/data/database.json');
          if (fs.existsSync(dbPath)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(dbPath, 'utf-8'));
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ products: [], reviews: [], orders: [], kitchenStatus: 'auto' }));
          }
          return;
        }

        // Handle POST /api/data
        if (req.method === 'POST' && req.url === '/api/data') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const dbPath = path.resolve('src/data/database.json');
              
              // Process images if they are included in the backup format
              if (data.localImages && Object.keys(data.localImages).length > 0) {
                const uploadsDir = path.resolve('public/uploads');
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
                
                // Map of old base64 id/string to new path
                const imagePathMap = {};
                
                for (const [key, base64] of Object.entries(data.localImages)) {
                  // key is usually the product ID
                  if (base64 && base64.startsWith('data:image')) {
                    const matches = base64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                      const buffer = Buffer.from(matches[2], 'base64');
                      const filename = `img_${key}_${Date.now()}.${ext}`;
                      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
                      imagePathMap[key] = `/uploads/${filename}`;
                      imagePathMap[base64] = `/uploads/${filename}`; // In case product has full base64
                    }
                  }
                }
                
                // Update product images
                if (data.products) {
                  data.products = data.products.map(p => {
                    if (imagePathMap[p.id]) {
                      p.image = imagePathMap[p.id];
                    } else if (imagePathMap[p.image]) {
                      p.image = imagePathMap[p.image];
                    }
                    return p;
                  });
                }
                // We don't need to save localImages in the file anymore
                delete data.localImages;
              }

              fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
          return;
        }

        // Handle POST /api/upload
        if (req.method === 'POST' && req.url === '/api/upload') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const { base64, id } = JSON.parse(body);
              if (!base64 || !base64.startsWith('data:image')) {
                 throw new Error('Invalid image data');
              }
              const uploadsDir = path.resolve('public/uploads');
              if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
              
              const matches = base64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
              if (matches && matches.length === 3) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const filename = `upload_${id || Date.now()}.${ext}`;
                fs.writeFileSync(path.join(uploadsDir, filename), buffer);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ path: `/uploads/${filename}` }));
              } else {
                throw new Error('Invalid base64 format');
              }
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localDBPlugin()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    open: true,
  },
})
