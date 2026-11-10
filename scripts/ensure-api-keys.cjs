const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'app', 'components');
const destino = path.join(dir, 'api-keys.ts');
if (!fs.existsSync(destino)) {
  fs.copyFileSync(path.join(dir, 'api-keys.example.ts'), destino);
  console.log('Se creó src/app/components/api-keys.ts vacío: agrega tu token de apisperu para consultar DNI/RUC.');
}
