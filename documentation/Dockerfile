# Setup Python dependencies
FROM python:3.12-slim-bullseye
RUN apt-get update && apt upgrade -y && \
    apt install -y git curl && \
    # Debian packages are way too old to be relied upon here
    # hence turning to Python:
    pip install pipenv --upgrade pip

# Installing Python requirements
WORKDIR /opt/app
COPY . .
ENV PIPENV_VENV_IN_PROJECT=1
RUN pipenv install --three

# Serving locally
CMD . /opt/app/.venv/bin/activate && mkdocs serve -a 0.0.0.0:8000
