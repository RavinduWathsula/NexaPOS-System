import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import categoryRoutes from './category.routes.js'
import brandRoutes from './brand.routes.js'
import productRoutes from './product.routes.js'
import deviceRoutes from './device.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/categories', categoryRoutes)
router.use('/brands', brandRoutes)
router.use('/products', productRoutes)
router.use('/devices', deviceRoutes)

export default router
