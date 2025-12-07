# Frontend Service

Next.js 14 frontend application for Enterprise Employee Management System.

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Framer Motion** animations
- **Axios** for API calls

## ✨ Features

- Modern animated landing page
- Employee dashboard with full CRUD
- Real-time search
- Dark mode toggle
- Responsive design
- Type-safe with TypeScript

## 🏗️ Project Structure

```
frontend-service/
├── app/
│   ├── dashboard/         # Dashboard page
│   ├── page.tsx          # Landing page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── EmployeeTable.tsx
│   ├── EmployeeForm.tsx
│   └── Header.tsx
├── lib/
│   ├── api.ts            # API client
│   └── utils.ts          # Utilities
├── codepipeline/
│   └── deploy.yaml       # ECS deployment config
├── Dockerfile            # Production container
├── Jenkinsfile          # CI/CD pipeline
└── package.json
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Application available at: `http://localhost:3000`

## 🐳 Docker

```bash
# Build
docker build -t frontend .

# Run
docker run -p 3000:3000 frontend
```

## 📝 Deployment Configuration

Edit `codepipeline/deploy.yaml`:

```yaml
service_name: frontend
subdomain: www

ecs:
  cpu: 256                    # CPU units
  memory: 512                 # Memory in MB
  desired_count: 2            # Number of tasks
  container_port: 3000
  health_check_path: /

environment:
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: https://api.webbyftw.co.in/api

ssm_parameters: []
```

## 🚀 Deployment

### Via Jenkins (Recommended)
```bash
git add .
git commit -m "Updated UI"
git push origin main
# Jenkins deploys automatically with zero downtime!
```

### Manual Deployment
```bash
python3 deploy.py
```

## 🔄 CI/CD Pipeline

Jenkins automatically:
1. Detects code changes
2. Runs build tests
3. Builds Docker image
4. Pushes to ECR
5. Creates new ECS task definition
6. Deploys with blue-green strategy
7. Waits for health checks
8. Switches traffic (zero downtime!)
9. Sends email notification

**Deployment time**: ~6 minutes (includes Next.js build)
**Downtime**: 0 seconds

## 🏥 Health Check

```bash
curl https://www.webbyftw.co.in/
```

## 📊 Monitoring

```bash
# View logs
aws logs tail /ecs/auto-deploy-prod --follow --filter-pattern "frontend"

# Check service status
aws ecs describe-services \
  --cluster auto-deploy-prod-cluster \
  --service frontend
```

## 🔐 Environment Variables

- `NODE_ENV` - Environment (development/production)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry

## 🧪 Testing

```bash
# Build test
npm run build

# Lint
npm run lint
```

## 📦 Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## 🌐 Service URL

**Production**: https://www.webbyftw.co.in

## 🎨 Styling

- Tailwind CSS for styling
- shadcn/ui for components
- Framer Motion for animations
- Dark mode support

## 📱 Pages

- `/` - Animated landing page
- `/dashboard` - Employee management dashboard

---

**Maintained by Frontend Team**
