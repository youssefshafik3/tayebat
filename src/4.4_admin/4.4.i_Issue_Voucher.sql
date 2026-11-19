-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Issue_Voucher
@customer_id INT,@promo_code VARCHAR(30),@is_percentage BIT,@amount DECIMAL(10,2),@expiry_date DATE,@admin_id INT
AS
BEGIN
IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@admin_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id)
BEGIN
RETURN -1;
END;

IF(@promo_code IS NULL OR @is_percentage IS NULL OR @amount IS NULL OR @expiry_date IS NULL OR @amount<=0)OR(@is_percentage =1 AND (@amount<1 OR @amount>100))OR(@expiry_date<CAST(GETDATE() AS DATE))
BEGIN
RETURN -1;
END;

IF EXISTS(SELECT 1 FROM Users U INNER JOIN Customer C ON U.user_id=C.customer_id AND C.customer_id=@customer_id AND U.account_status='Blacklisted')
BEGIN
RETURN -3;
END;
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;


IF NOT EXISTS(SELECT 1 FROM Customer C WHERE C.customer_id=@customer_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Voucher V WHERE V.promo_code=@promo_code)
BEGIN
RETURN -2;
END;


INSERT INTO Voucher (promo_code, is_percentage, amount, expiry_date, customer_id)
VALUES (@promo_code, @is_percentage, @amount, @expiry_date, @customer_id);
RETURN 0;
END;
GO