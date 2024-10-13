// vite.config.ts
import { defineConfig } from "file:///C:/Users/aleks/RiderProjects/FormEditor/formeditor.client/node_modules/vite/dist/node/index.js";
import solid from "file:///C:/Users/aleks/RiderProjects/FormEditor/formeditor.client/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import devtools from "file:///C:/Users/aleks/RiderProjects/FormEditor/formeditor.client/node_modules/solid-devtools/dist/vite.js";
import fs from "fs";
import path from "path";
import child_process from "child_process";
import { env } from "process";
var __vite_injected_original_dirname = "C:\\Users\\aleks\\RiderProjects\\FormEditor\\formeditor.client";
var baseFolder = env.APPDATA !== void 0 && env.APPDATA !== "" ? `${env.APPDATA}/ASP.NET/https` : `${env.HOME}/.aspnet/https`;
var certificateName = "formeditor.client";
var certFilePath = path.join(baseFolder, `${certificateName}.pem`);
var keyFilePath = path.join(baseFolder, `${certificateName}.key`);
if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
  if (0 !== child_process.spawnSync("dotnet", [
    "dev-certs",
    "https",
    "--export-path",
    certFilePath,
    "--format",
    "Pem",
    "--no-password"
  ], { stdio: "inherit" }).status) {
    throw new Error("Could not create certificate.");
  }
}
var target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` : env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(";")[0] : "https://localhost:7090";
var vite_config_default = defineConfig({
  plugins: [solid(), devtools({
    /* features options - all disabled by default */
    autoname: true
    // e.g. enable autoname
  })],
  resolve: {
    alias: {
      "~": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    proxy: {
      "^/api": {
        target,
        secure: false
      }
    },
    port: 5173,
    https: {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath)
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhbGVrc1xcXFxSaWRlclByb2plY3RzXFxcXEZvcm1FZGl0b3JcXFxcZm9ybWVkaXRvci5jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFsZWtzXFxcXFJpZGVyUHJvamVjdHNcXFxcRm9ybUVkaXRvclxcXFxmb3JtZWRpdG9yLmNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWxla3MvUmlkZXJQcm9qZWN0cy9Gb3JtRWRpdG9yL2Zvcm1lZGl0b3IuY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBzb2xpZCBmcm9tICd2aXRlLXBsdWdpbi1zb2xpZCdcclxuaW1wb3J0IGRldnRvb2xzIGZyb20gJ3NvbGlkLWRldnRvb2xzL3ZpdGUnXHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHsgZW52IH0gZnJvbSAncHJvY2Vzcyc7XHJcblxyXG5jb25zdCBiYXNlRm9sZGVyID1cclxuICAgIGVudi5BUFBEQVRBICE9PSB1bmRlZmluZWQgJiYgZW52LkFQUERBVEEgIT09ICcnXHJcbiAgICAgICAgPyBgJHtlbnYuQVBQREFUQX0vQVNQLk5FVC9odHRwc2BcclxuICAgICAgICA6IGAke2Vudi5IT01FfS8uYXNwbmV0L2h0dHBzYDtcclxuXHJcbmNvbnN0IGNlcnRpZmljYXRlTmFtZSA9IFwiZm9ybWVkaXRvci5jbGllbnRcIjtcclxuY29uc3QgY2VydEZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VGb2xkZXIsIGAke2NlcnRpZmljYXRlTmFtZX0ucGVtYCk7XHJcbmNvbnN0IGtleUZpbGVQYXRoID0gcGF0aC5qb2luKGJhc2VGb2xkZXIsIGAke2NlcnRpZmljYXRlTmFtZX0ua2V5YCk7XHJcblxyXG5pZiAoIWZzLmV4aXN0c1N5bmMoY2VydEZpbGVQYXRoKSB8fCAhZnMuZXhpc3RzU3luYyhrZXlGaWxlUGF0aCkpIHtcclxuICAgIGlmICgwICE9PSBjaGlsZF9wcm9jZXNzLnNwYXduU3luYygnZG90bmV0JywgW1xyXG4gICAgICAgICdkZXYtY2VydHMnLFxyXG4gICAgICAgICdodHRwcycsXHJcbiAgICAgICAgJy0tZXhwb3J0LXBhdGgnLFxyXG4gICAgICAgIGNlcnRGaWxlUGF0aCxcclxuICAgICAgICAnLS1mb3JtYXQnLFxyXG4gICAgICAgICdQZW0nLFxyXG4gICAgICAgICctLW5vLXBhc3N3b3JkJyxcclxuICAgIF0sIHsgc3RkaW86ICdpbmhlcml0JywgfSkuc3RhdHVzKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGNyZWF0ZSBjZXJ0aWZpY2F0ZS5cIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IHRhcmdldCA9IGVudi5BU1BORVRDT1JFX0hUVFBTX1BPUlQgPyBgaHR0cHM6Ly9sb2NhbGhvc3Q6JHtlbnYuQVNQTkVUQ09SRV9IVFRQU19QT1JUfWAgOlxyXG4gICAgZW52LkFTUE5FVENPUkVfVVJMUyA/IGVudi5BU1BORVRDT1JFX1VSTFMuc3BsaXQoJzsnKVswXSA6ICdodHRwczovL2xvY2FsaG9zdDo3MDkwJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBwbHVnaW5zOiBbc29saWQoKSwgZGV2dG9vbHMoe1xyXG4gICAgICAgIC8qIGZlYXR1cmVzIG9wdGlvbnMgLSBhbGwgZGlzYWJsZWQgYnkgZGVmYXVsdCAqL1xyXG4gICAgICAgIGF1dG9uYW1lOiB0cnVlLCAvLyBlLmcuIGVuYWJsZSBhdXRvbmFtZVxyXG4gICAgfSksXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICBcIn5cIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICAnXi9hcGknOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvcnQ6IDUxNzMsXHJcbiAgICAgICAgaHR0cHM6IHtcclxuICAgICAgICAgICAga2V5OiBmcy5yZWFkRmlsZVN5bmMoa2V5RmlsZVBhdGgpLFxyXG4gICAgICAgICAgICBjZXJ0OiBmcy5yZWFkRmlsZVN5bmMoY2VydEZpbGVQYXRoKSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVcsU0FBUyxvQkFBb0I7QUFDdFksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sY0FBYztBQUNyQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFDakIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxXQUFXO0FBTnBCLElBQU0sbUNBQW1DO0FBUXpDLElBQU0sYUFDRixJQUFJLFlBQVksVUFBYSxJQUFJLFlBQVksS0FDdkMsR0FBRyxJQUFJLE9BQU8sbUJBQ2QsR0FBRyxJQUFJLElBQUk7QUFFckIsSUFBTSxrQkFBa0I7QUFDeEIsSUFBTSxlQUFlLEtBQUssS0FBSyxZQUFZLEdBQUcsZUFBZSxNQUFNO0FBQ25FLElBQU0sY0FBYyxLQUFLLEtBQUssWUFBWSxHQUFHLGVBQWUsTUFBTTtBQUVsRSxJQUFJLENBQUMsR0FBRyxXQUFXLFlBQVksS0FBSyxDQUFDLEdBQUcsV0FBVyxXQUFXLEdBQUc7QUFDN0QsTUFBSSxNQUFNLGNBQWMsVUFBVSxVQUFVO0FBQUEsSUFDeEM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKLEdBQUcsRUFBRSxPQUFPLFVBQVcsQ0FBQyxFQUFFLFFBQVE7QUFDOUIsVUFBTSxJQUFJLE1BQU0sK0JBQStCO0FBQUEsRUFDbkQ7QUFDSjtBQUVBLElBQU0sU0FBUyxJQUFJLHdCQUF3QixxQkFBcUIsSUFBSSxxQkFBcUIsS0FDckYsSUFBSSxrQkFBa0IsSUFBSSxnQkFBZ0IsTUFBTSxHQUFHLEVBQUUsQ0FBQyxJQUFJO0FBRzlELElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUztBQUFBO0FBQUEsSUFFeEIsVUFBVTtBQUFBO0FBQUEsRUFDZCxDQUFDLENBQUU7QUFBQSxFQUNILFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE9BQU87QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMO0FBQUEsUUFDQSxRQUFRO0FBQUEsTUFDWjtBQUFBLElBQ0o7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNILEtBQUssR0FBRyxhQUFhLFdBQVc7QUFBQSxNQUNoQyxNQUFNLEdBQUcsYUFBYSxZQUFZO0FBQUEsSUFDdEM7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
