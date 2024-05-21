import * as express from 'express'
import * as passport from 'passport'
import { AppModule } from './app.module'
import * as session from 'express-session'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const PORT: number = parseInt(process.env.PORT, 10) || 2005
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'https://memegoat.io',
      'http://localhost:3000',
      `http://localhost:${PORT}`,
      'https://testing.memegoat.io',
      'https://socialfi.memegoat.io',
      'https://socialfi.memegoat.dev',
      'https://memegoat.onrender.com',
      'https://api-socialfi.memegoat.io',
      'https://api-socialfi.memegoat.dev',
      'https://memegoat-socialfi-backend.onrender.com',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: 'GET,POST,DELETE,OPTIONS',
  })

  app.use(express.json({ limit: 2 << 20 }))
  app.use(cookieParser())
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
    }),
  )
  app.use(passport.session())
  app.use(passport.initialize())
  app.useGlobalPipes(new ValidationPipe())

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Memegoat API')
    .setVersion('1.2.7')
    .addServer(`https://api-socialfi.memegoat.dev`, 'Staging')
    .addServer(`http://localhost:${PORT}`, 'Local')
    .addBearerAuth()
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions)
  SwaggerModule.setup('docs', app, swaggerDocument)

  try {
    await app.listen(PORT)
    console.log(`http://localhost:${PORT}`)
  } catch (err) {
    console.error(err.message)
  }
}
bootstrap()
