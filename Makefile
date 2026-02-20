.PHONY: dev build migrate seed logs restart

# Local development
dev:
	@echo "Starting backend and frontend..."
	@(cd backend && npm run dev) & (cd frontend && npm run dev)

# Production build (local test)
build:
	cd backend && npm run build
	cd frontend && npm run build

# Database operations
migrate:
	cd backend && npx prisma migrate dev

migrate-prod:
	cd backend && npx prisma migrate deploy

seed:
	cd backend && npx prisma db seed

studio:
	cd backend && npx prisma studio

# VPS operations (run from local machine)
logs:
	ssh $(VPS_USER)@$(VPS_HOST) "pm2 logs studiomystri-api --lines 100"

restart:
	ssh $(VPS_USER)@$(VPS_HOST) "pm2 restart studiomystri-api"

status:
	ssh $(VPS_USER)@$(VPS_HOST) "pm2 status && df -h && free -h"

deploy-manual:
	ssh $(VPS_USER)@$(VPS_HOST) "bash /var/www/studiomystri/scripts/deploy.sh"
