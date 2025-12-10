# =========================
# Stage 1: Builder
# =========================
FROM node:22-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# =========================
# Stage 2: Runtime
# =========================
FROM node:22-slim AS runtime

# Set timezone to UTC
ENV TZ=UTC

# Set working directory
WORKDIR /app

# Install system dependencies: cron, tzdata, bash
RUN apt-get update && \
    apt-get install -y cron tzdata bash && \
    ln -snf /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Node.js dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --from=builder /app ./

# Secure the private key
RUN chmod 600 student_private.pem

# Copy cron configuration
COPY cronjob /etc/cron.d/totp-cron

# Set correct cron file permissions
RUN chmod 0644 /etc/cron.d/totp-cron

# Register cron job
RUN crontab /etc/cron.d/totp-cron

# Create persistent data directories
RUN mkdir -p /data /cron && \
    chmod -R 755 /data /cron

# Expose API port
EXPOSE 8080

# Start cron service + API server
CMD ["sh", "-c", "cron && node server.js"]
