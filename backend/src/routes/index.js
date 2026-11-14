import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import categoryRoutes from './category.routes.js'
import brandRoutes from './brand.routes.js'
import productRoutes from './product.routes.js'
import deviceRoutes from './device.routes.js'
import inventoryRoutes from './inventory.routes.js'
import supplierRoutes from './supplier.routes.js'
import purchaseRoutes from './purchase.routes.js'
import posRoutes from './pos.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/categories', categoryRoutes)
router.use('/brands', brandRoutes)
router.use('/products', productRoutes)
router.use('/devices', deviceRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/suppliers', supplierRoutes)
router.use('/purchases', purchaseRoutes)
router.use('/pos', posRoutes)

export default router
