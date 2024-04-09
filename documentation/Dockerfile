# Setup Python dependencies
ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim-bullseye

# Update package lists and upgrade installed packages
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y git curl libcairo2 && \
    # Debian packages are way too old to be relied upon here
    # hence turning to Python:
    pip install --upgrade pip

WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install MkDocs and any additional requirements
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE $PORT

# Serving locally
CMD mkdocs serve -a ${HOST}:${PORT}
