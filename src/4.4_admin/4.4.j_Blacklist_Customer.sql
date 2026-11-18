-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Blacklist_Customer
@customer_id INT,@admin_id INT,@reason VARCHAR(255)
AS
BEGIN
IF ((@customer_id IS NULL OR @admin_id IS NULL OR @reason IS NULL) OR NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id) OR NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@admin_id))
BEGIN
RETURN -1;
END;
IF EXISTS (SELECT 1 FROM Blacklist B WHERE B.customer_id=@customer_id) OR EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id AND U.account_status='Blacklisted')
BEGIN
RETURN -3;
END;
IF (NOT EXISTS(SELECT 1 FROM Customer C WHERE C.customer_id=@customer_id) OR NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id))
BEGIN
RETURN -3;
END;
IF EXISTS(SELECT 1 FROM Admin A INNER JOIN Zone Z ON A.zone_id=Z.zone_id INNER JOIN Address AD ON Z.zone_id=AD.zone_id AND AD.customer_id=@customer_id AND A.admin_id<>@admin_id)
BEGIN
RETURN -3;
END;
UPDATE Users
SET account_status='Blacklisted' WHERE user_id=@customer_id;
INSERT INTO Blacklist(customer_id,admin_id,reason) VALUES(@customer_id,@admin_id,@reason);
DECLARE @orders_to_cancel TABLE (
row_id int IDENTITY(1,1),order_id int
);
INSERT INTO @orders_to_cancel (order_id)
SELECT o.order_id
FROM Orders o
JOIN Cart c ON o.cart_id = c.cart_id
WHERE c.customer_id = @customer_id
AND o.status <> 'Cancelled'
AND NOT EXISTS (
SELECT 1 FROM SubOrder so
WHERE so.order_id = o.order_id 
AND so.status IN ('Picked Up', 'Delivered')
);
DECLARE @current_order_id int;
WHILE EXISTS (SELECT 1 FROM @orders_to_cancel)
BEGIN   
SELECT TOP 1 @current_order_id = order_id  FROM @orders_to_cancel;      
EXEC Cancel_Order @order_id = @current_order_id;
DELETE FROM @orders_to_cancel 
WHERE order_id = @current_order_id;
END;
DELETE FROM Voucher WHERE customer_id=@customer_id AND status='Unused';
RETURN 0;
END;
GO