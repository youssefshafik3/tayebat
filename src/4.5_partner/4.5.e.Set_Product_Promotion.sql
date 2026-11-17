GO 
CREATE PROCEDURE Set_Product_Promotion
@product_id INT, @discount_amount DECIMAL(10,2)
AS
BEGIN 

DECLARE @price DECIMAL(10,2)
SELECT @price = price
FROM Product
WHERE product_id = @product_id;

IF @product_id IS NULL OR @price IS NULL OR @discount_amount IS NULL OR
@discount_amount < 0 OR @discount_amount > 0.5*@price
RETURN -1;

IF EXISTS (SELECT * FROM Product P INNER JOIN Business B ON P.business_id = B.business_id
INNER JOIN Users U ON B.partner_id = U.user_id WHERE P.product_id = @product_id
AND U.account_status = 'Blacklisted')
RETURN -3;

IF EXISTS (SELECT * FROM Product P INNER JOIN Business B
ON P.business_id = B.business_id WHERE P.product_id = @product_id AND B.status = 'Suspended')
RETURN -4;

UPDATE Product
SET Product.discount_amount = @discount_amount
WHERE Product.product_id = @product_id;
RETURN 0;

END;
GO