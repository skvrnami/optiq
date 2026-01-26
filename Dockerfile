# dashboard
FROM oven/bun:1 AS dashboard-builder
WORKDIR /workspace/dashboard
COPY dashboard/package.json dashboard/bun.lock ./
RUN bun install --frozen-lockfile
COPY dashboard/ ./
# Create the output directory structure matching vite.config.ts outDir
RUN mkdir -p /workspace/app/static/dashboard && bun run build

# R application
FROM rocker/r-ver:4.4.0

# Install system dependencies required for R packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    libpng-dev \
    libjpeg-dev \
    zlib1g-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install renv
RUN R -e "install.packages('renv', repos = 'https://cloud.r-project.org/')"

# Copy renv files first for better caching
COPY renv.lock renv.lock
COPY .Rprofile .Rprofile
COPY renv/activate.R renv/activate.R
COPY renv/settings.json renv/settings.json

# Restore R packages
RUN R -e "renv::restore()"

# Copy application files
COPY app/ app/
COPY rhino.yml rhino.yml
COPY config.yml config.yml
COPY dependencies.R dependencies.R

# Copy built dashboard from the builder stage
COPY --from=dashboard-builder /workspace/app/static/dashboard app/static/dashboard

# Expose Shiny default port
EXPOSE 3838

# Run the app
CMD ["R", "-e", "shiny::runApp(rhino::app(), host = '0.0.0.0', port = 3838)"]
