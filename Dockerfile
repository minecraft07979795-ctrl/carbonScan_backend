# ---------- Build Stage ----------
FROM node:18 AS build-stage
 
# Install Python3 and venv-related tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    python3-pip \
&& rm -rf /var/lib/apt/lists/*
 
# Set working directory
WORKDIR /usr/src/app
 
# Create Python virtual environment
RUN python3 -m venv /usr/src/app/venv
 
# Copy requirements and install Python dependencies inside venv
COPY requirements.txt ./
RUN . /usr/src/app/venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt
 
# Copy Node.js package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install
 
# Copy the full project
COPY . .
 
# ---------- Runtime Stage ----------
FROM node:18 AS runtime-stage
 
WORKDIR /usr/src/app
 
# Copy everything from build stage
COPY --from=build-stage /usr/src/app /usr/src/app
 
# Ensure Python inside venv is used by default
ENV PATH="/usr/src/app/venv/bin:$PATH"
 
# Expose app port
EXPOSE 5000
 
# Start the application
CMD ["npm","run","prod"]
# CMD ["npm", "run", "dev"]