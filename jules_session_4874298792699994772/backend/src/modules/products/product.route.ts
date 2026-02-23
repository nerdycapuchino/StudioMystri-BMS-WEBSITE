import { validateQuery } from '../../middleware/validateQuery';
import { Router } from 'express';
import * as ctrl from './product.controller';
import { validate } from '../../middleware/validate';
import { createProductSchema, updateProductSchema, createVariantSchema, updateVariantSchema } from './product.schema';
import { upload } from '../../middleware/upload';

export const productsRouter = Router();

productsRouter.get('/', validateQuery, ctrl.list);
productsRouter.get('/barcode/:code', ctrl.getByBarcode);
productsRouter.get('/:id', ctrl.getById);
productsRouter.post('/', validate(createProductSchema), ctrl.create);
productsRouter.put('/:id', validate(updateProductSchema), ctrl.update);
productsRouter.delete('/:id', ctrl.remove);

// Variants
productsRouter.post('/:id/variants', validate(createVariantSchema), ctrl.addVariant);
productsRouter.put('/:id/variants/:variantId', validate(updateVariantSchema), ctrl.updateVariant);
productsRouter.delete('/:id/variants/:variantId', ctrl.deleteVariant);

// Images
productsRouter.post('/:id/images', upload.single('image'), ctrl.uploadImage);
