FROM python:3.12-slim

WORKDIR /app

# Install system packages required for compiling libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to utilize Docker build layer caching
COPY requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend codebase into container
COPY . /app/backend

# Set environment PYTHONPATH so imports (from backend.app...) resolve cleanly
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
