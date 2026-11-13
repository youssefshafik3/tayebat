GO 
CREATE PROCEDURE Set_Product_Promotion
@product_id INT, @discount_amount DECIMAL(10,2)
AS
BEGIN 

IF @discount_amount <= 0 OR @discount_amount >= 0.5*(SELECT P.price FROM Product P WHERE P.product_id = @product_id)
BEGIN
RETURN -1;
END

UPDATE Product
SET Product.discount_amount = @discount_amount
WHERE Product.product_id = @product_id;
RETURN 0;

END
GO