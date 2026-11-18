GO 
CREATE PROCEDURE Toggle_Favorite
@customer_id INT, @item_id INT, @item_type VARCHAR(20)
AS
BEGIN

IF @customer_id IS NULL OR NOT EXISTS(SELECT * FROM Customer WHERE customer_id = @customer_id) 
OR @item_id IS NULL OR @item_type IS NULL 
RETURN -1;

IF EXISTS(SELECT * FROM Users U WHERE U.user_id = @customer_id
      AND U.account_status = 'Blacklisted')
RETURN -3;

IF @item_type = 'Product'
BEGIN
IF NOT EXISTS(SELECT * FROM Product WHERE product_id = @item_id) 
RETURN -1;

IF EXISTS(SELECT * FROM Favorite_Product FP WHERE FP.customer_id = @customer_id AND FP.product_id = @item_id)
BEGIN
DELETE FROM Favorite_Product
WHERE product_id = @item_id AND customer_id = @customer_id;
END 

ELSE
BEGIN
INSERT INTO Favorite_Product(customer_id , product_id)
VALUES(@customer_id, @item_id)
END
END

ELSE IF @item_type = 'Business'
BEGIN
IF NOT EXISTS(SELECT * FROM Business WHERE business_id = @item_id) 
RETURN -1;

IF EXISTS(SELECT * FROM Favorite_Business FB WHERE FB.customer_id = @customer_id AND FB.business_id = @item_id)
BEGIN
DELETE FROM Favorite_Business
WHERE business_id = @item_id AND customer_id = @customer_id;
END

ELSE
BEGIN
INSERT INTO Favorite_Business(customer_id , business_id)
VALUES(@customer_id, @item_id)
END
END

ELSE
RETURN -1;

RETURN 0;

END
GO