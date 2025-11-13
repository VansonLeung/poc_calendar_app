import 'dotenv/config';
import packageJson from './package.json' assert { type: 'json' };

import { initializeModels } from "./src/models/index.js";
import { initializeAPIs } from "./src/apis/index.js";
import { initializeSwagger } from "./src/apis/swagger.js";
import { initializeMigrations } from './src/models/migrations/index.js';

const app = await (async () => {
  
  console.log(packageJson)
  const models = await initializeModels();
  await initializeMigrations({ models });
  const app = initializeAPIs({ models });
  initializeSwagger({ app, models, packageJson });
  
  return app;
})();

const PORT = process.env.PORT || 3000;

app.listen(PORT, (e) => {
  console.log(`Server is running on http://localhost:${PORT}`, e);
});




