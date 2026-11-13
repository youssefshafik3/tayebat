GO 
CREATE PROCEDURE Toggle_Product_Status
@product_id INT, @is_available BIT
AS

declare @business_state VARCHAR(20)

SELECT @business_state = B.status
FROM Product P INNER JOIN Business B ON P.business_id = B.business_id
WHERE P.product_id = @product_id;

IF @business_state = 'Suspended' AND @is_available = 1
BEGIN 
RETURN -4;
END

UPDATE Product 
SET Product.is_available = @is_available
WHERE Product.product_id = @product_id;

RETURN 0;
GO
