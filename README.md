# Microservice for managing products

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">This is a microservice for managing products, built with NestJS.</p>

## Developer Settings

To configure and run this project in your local environment, follow these steps:

### Clone the repository

Clone this repository to your local machine using:

```bash
git clone <REPOSITORY_URL>
```

### Install Dependencies

Navigate to the root of the project and run:

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root of the project. You can refer to the included `.env.template` file. Make sure you fill out all the required variables.

### Run Prisma Migrations

Run the following command to apply the migrations to the database:

```bash
npx prisma migrate dev
```

### Run the Application

Finally, start the application with:

```bash
npm run start:dev
```
