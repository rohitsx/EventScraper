# Use the official Node.js runtime as the base image
FROM node:23-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml (if applicable)
COPY package*.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Expose the port your app will run on
EXPOSE 3001

# Command to run the app using nodemon (make sure it's installed)
CMD ["pnpm", "run", "dev"]
