-- MARTIN JOSEPH 64-27346
CREATE FUNCTION dbo.CustomerLoginValidation(@username VARCHAR(30),@password VARCHAR(30)) RETURNS BIT
AS
BEGIN
DECLARE @success BIT=0;
IF EXISTS(SELECT 1 FROM Users U INNER JOIN Customer C ON U.user_id=C.customer_id WHERE U.username=@username AND U.password=@password AND U.account_status ='Active')
BEGIN
SET @success=1;
END;
RETURN @success;
END;
GO