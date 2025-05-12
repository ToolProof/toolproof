# Use Node.js base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any dependencies specified in package.json
RUN npm install

# Copy the rest of the application source code to the working directory
COPY dist/ ./dist/

# Expose the application port
EXPOSE 8080

# Define the command to run the application
CMD ["node", "dist/server.js"]

