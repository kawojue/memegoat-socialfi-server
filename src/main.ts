import * as express from 'express'
import * as passport from 'passport'
import { AppModule } from './app.module'
import * as session from 'express-session'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const PORT: number = parseInt(process.env.PORT, 10) || 2007
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: 'http://localhost:3000',
    // origin: [
    //   'http://localhost:3000',
    //   // `http://localhost:${PORT}`,
    //   // 'https://memegoat.onrender.com',
    // ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET, DELETE, POST, PATCH"
  })
  app.use(express.json({ limit: 1 << 20 }))
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Memegoat API')
    .setVersion('1.2.7')
    .addServer(`https://memegoat.onrender.com/`, 'Staging')
    .addServer(`http://localhost:${PORT}/`, 'Local')
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
