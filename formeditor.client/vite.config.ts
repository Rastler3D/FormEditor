import {defineConfig} from 'vite';
import solid from 'vite-plugin-solid'
import devtools from 'solid-devtools/vite'
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import {env} from 'process';
import {createHmac} from 'crypto';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "formeditor.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], {stdio: 'inherit',}).status) {
        throw new Error("Could not create certificate.");
    }
}

const meiliSearchApiKey = (env.MEILISEARCH_MASTER_KEY && env.MEILISEARCH_API_KEY_UUID) ? createHmac('sha256', env.MEILISEARCH_MASTER_KEY).update(env.MEILISEARCH_API_KEY_UUID).digest('hex') : undefined;

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7090';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [solid(), devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
    }),],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src")
        }
    },
    server: {
        proxy: {
            '^/api': {
                target,
                secure: false
            }
        },
        port: 5173,
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    },
    define: {
        'import.meta.env.VITE_MEILISEARCH_API_KEY': JSON.stringify(meiliSearchApiKey),
        'import.meta.env.VITE_API_URL': JSON.stringify("/api"),
        'import.meta.env.VITE_HUB_URL': JSON.stringify("/api/hub"),
    }
})
