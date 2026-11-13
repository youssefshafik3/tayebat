GO 
CREATE PROCEDURE Upsert_Product
@business_id INT, @product_id INT, @name VARCHAR(100), @description VARCHAR(255), @category VARCHAR(50), @price DECIMAL(10,2),
@is_available BIT
AS

declare @business_status VARCHAR(20)

SELECT @business_status = B.status
FROM Business B
WHERE B.business_id = @business_id

IF @business_status = 'Suspended' OR @business_id NOT IN (SELECT P.business_id FROM Product P WHERE P.product_id = @product_id)
BEGIN 
RETURN -4;
END

BEGIN 
IF @product_id IS NULL 
BEGIN 
INSERT INTO Product (name,description, category, price, is_available)
VALUES (@name, @description, @category, @price, @is_available)
RETURN 0;
END

UPDATE Product 
SET Product.name = @name,
Product.description = @description, 
Product.category = @category,
Product.price = @price,
Product.is_available = @is_available
WHERE Product.product_id = @product_id
RETURN 0;
END
GO