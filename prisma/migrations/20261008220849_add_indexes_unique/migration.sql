/*
  Warnings:

  - A unique constraint covering the columns `[name,brand_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX `brands_deleted_at_idx` ON `brands`(`deleted_at`);

-- CreateIndex
CREATE INDEX `products_deleted_at_idx` ON `products`(`deleted_at`);

-- CreateIndex
CREATE INDEX `products_name_idx` ON `products`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `products_name_brand_id_key` ON `products`(`name`, `brand_id`);

-- RenameIndex
ALTER TABLE `products` RENAME INDEX `products_brand_id_fkey` TO `products_brand_id_idx`;

-- RenameIndex
ALTER TABLE `products` RENAME INDEX `products_category_id_fkey` TO `products_category_id_idx`;
