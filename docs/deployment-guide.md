# DWPTS Production Deployment & Domain Setup Guide

This guide covers 4 ways to deploy DWPTS to a public URL or custom domain:

---

## ⚡ Option 1: Instant Public URL (0 Setup — Demo in 1 Minute)

To instantly share or test the application over the internet without setting up a cloud server, use **Cloudflare Tunnel** or **Ngrok**:

### 1. Using Cloudflare Tunnel (100% Free, No Account Required)
```powershell
# In PowerShell (run in separate terminals):

# Expose Frontend
npx cloudflared tunnel --url http://localhost:4200

# Expose Backend API
npx cloudflared tunnel --url http://localhost:5000
```
Cloudflare will give you instant HTTPS URLs (e.g., `https://random-name.trycloudflare.com`).

---

## ☁️ Option 2: Cloud PaaS Deployment (Vercel + Render / Railway)

### 1. Frontend (Angular SPA) on Vercel or Netlify (Free)
1. Build production bundle:
   ```powershell
   cd client/dwpts-angular
   npm run build -- --configuration production
   ```
2. The compiled static files are generated in `client/dwpts-angular/dist/dwpts-angular/browser`.
3. Deploy to **Vercel** or **Netlify**:
   - Link your GitHub repository.
   - Set **Build command**: `npm run build`
   - Set **Output directory**: `dist/dwpts-angular/browser`
   - Add a `vercel.json` rewrite rule for single-page routing:
     ```json
     {
       "routes": [{ "src": "/[^.]*", "dest": "/index.html" }]
     }
     ```

### 2. Backend API on Render or Railway
1. Push project to GitHub.
2. In [Railway.app](https://railway.app) or [Render.com](https://render.com), create a new **Web Service**.
3. Select `Dockerfile.api` as the Dockerfile.
4. Set Environment Variables:
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `Jwt__Key` = `<YourStrongSecretKey>`
   - `UseSqlite` = `true` (or configure cloud SQL Server connection string)
5. Add your custom domain (e.g. `api.yourdomain.com`) in the Render/Railway dashboard.

---

## 🐳 Option 3: Docker on Linux VPS (Ubuntu + Nginx + SSL + Custom Domain)

Best for full control and low cost ($4–$6/mo on DigitalOcean, Hetzner, AWS Lightsail, Linode).

### 1. DNS Setup at your Domain Registrar (Namecheap, GoDaddy, Cloudflare, etc.)
Create two `A` records pointing to your VPS IP address (`123.45.67.89`):
- `app.yourdomain.com` -> `123.45.67.89` (Frontend)
- `api.yourdomain.com` -> `123.45.67.89` (Backend API)

### 2. Run with Docker Compose on VPS
```bash
# Clone your repo onto the VPS
git clone https://github.com/your-username/DWPTS.git
cd DWPTS

# Launch full stack (Database, API, and Angular)
docker compose up -d --build
```

### 3. Setup Nginx Reverse Proxy with Free Let's Encrypt SSL
Install Nginx and Certbot:
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure Nginx (`/etc/nginx/sites-available/dwpts`):
```nginx
# Angular Frontend
server {
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:4200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ASP.NET Core API
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and generate SSL certificates:
```bash
sudo ln -s /etc/nginx/sites-available/dwpts /etc/nginx/sites-enabled/
sudo certbot --nginx -d app.yourdomain.com -d api.yourdomain.com
```

---

## 🏢 Option 4: On-Premise Windows Server with IIS

For corporate intranets or Windows Server environments:

### 1. Backend API on IIS
1. Install **.NET 8 Hosting Bundle** on the server.
2. Publish backend:
   ```powershell
   dotnet publish src/DWPTS.API/DWPTS.API.csproj -c Release -o C:\inetpub\wwwroot\dwpts-api
   ```
3. In IIS Manager:
   - Add Application Pool (`No Managed Code`).
   - Add Website pointing to `C:\inetpub\wwwroot\dwpts-api` on port `5000` or hostname `api.company.com`.

### 2. Angular Client on IIS
1. Install **URL Rewrite Module** for IIS.
2. Publish frontend:
   ```powershell
   cd client/dwpts-angular
   npm run build -- --configuration production
   ```
   Copy contents of `dist/dwpts-angular/browser` to `C:\inetpub\wwwroot\dwpts-app`.
3. Add a `web.config` file inside `C:\inetpub\wwwroot\dwpts-app`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="Angular Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```
4. Bind domain name (e.g. `dwpts.company.com`) and attach your SSL certificate.
