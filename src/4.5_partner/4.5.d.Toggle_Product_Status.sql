--Ziad Yasser Ibrahim 65-33790

GO 
CREATE PROCEDURE Toggle_Product_Status
@product_id INT, @is_available BIT
AS

IF @product_id IS NULL OR @is_available IS NULL OR NOT EXISTS (SELECT * FROM Product Where product_id = @product_id)
RETURN -1;

IF EXISTS (SELECT * FROM Product P INNER JOIN Business B ON P.business_id = B.business_id
INNER JOIN Users U ON B.partner_id = U.user_id WHERE P.product_id = @product_id
AND U.account_status = 'Blacklisted')
RETURN -3;

IF @is_available = 1 AND EXISTS (SELECT * FROM Product P INNER JOIN Business B
ON P.business_id = B.business_id WHERE P.product_id = @product_id AND B.status = 'Suspended')
RETURN -4;

UPDATE Product 
SET Product.is_available = @is_available
WHERE Product.product_id = @product_id;

RETURN 0;
GO
