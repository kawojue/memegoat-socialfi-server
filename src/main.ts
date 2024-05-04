import * as express from 'express'
import { AppModule } from './app.module'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const PORT: number = parseInt(process.env.PORT, 10) || 2007
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'http://localhost:3000',
      `http://localhost:${PORT}`,
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: 'GET',
  })
  app.use(express.json({ limit: 100 << 20 }))

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Memegoat API')
    .setVersion('1.2.7')
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
