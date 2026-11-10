const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'app', 'components');
const destino = path.join(dir, 'api-keys.ts');
const token = (process.env.APISPERU_TOKEN || '').trim();

if (token) {
  fs.writeFileSync(destino, `export const apisPeruToken = ${JSON.stringify(token)};\n`);
  console.log('api-keys.ts generado desde la variable de entorno APISPERU_TOKEN.');
} else if (!fs.existsSync(destino)) {
  fs.copyFileSync(path.join(dir, 'api-keys.example.ts'), destino);
  console.log('Se creó src/app/components/api-keys.ts vacío: define APISPERU_TOKEN o pega tu token para consultar DNI/RUC.');
}
