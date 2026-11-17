GO 
CREATE PROCEDURE Upsert_Product
@business_id INT, @product_id INT, @name VARCHAR(100), @description VARCHAR(255), @category VARCHAR(50), @price DECIMAL(10,2),
@is_available BIT
AS

IF @business_id IS NULL OR NOT EXISTS (SELECT * FROM Business WHERE business_id = @business_id)
OR @name IS NULL OR LTRIM(RTRIM(@name)) = '' OR @category IS NULL OR LTRIM(RTRIM(@category)) = ''
OR @price IS NULL OR @price <= 0 OR @is_available IS NULL
RETURN -1;

IF EXISTS (SELECT * FROM Business B INNER JOIN Users U ON B.partner_id = U.user_id
        WHERE B.business_id = @business_id AND U.account_status = 'Blacklisted')
RETURN -3;

IF EXISTS (SELECT * FROM Business WHERE business_id = @business_id
AND status = 'Suspended')
RETURN -4;

BEGIN 
IF @product_id IS NULL 
BEGIN 
INSERT INTO Product (name, description, category, price, is_available, business_id)
VALUES (@name, @description, @category, @price, @is_available, @business_id);
RETURN 0;
END

IF NOT EXISTS (SELECT * FROM Product WHERE product_id = @product_id)
RETURN -1;

IF NOT EXISTS (SELECT * FROM Product WHERE product_id = @product_id
AND business_id = @business_id)
RETURN -3;

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