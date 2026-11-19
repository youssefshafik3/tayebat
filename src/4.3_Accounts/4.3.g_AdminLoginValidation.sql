-- MARTIN JOSEPH 64-27346
CREATE FUNCTION dbo.AdminLoginValidation(@username VARCHAR(30),@password VARCHAR(30)) RETURNS BIT
AS
BEGIN
DECLARE @success BIT=0;
IF EXISTS(SELECT 1 FROM Users U INNER JOIN Admin A ON U.user_id=A.admin_id AND U.username=@username AND U.password=@password AND U.account_status ='Active')
BEGIN
SET @success=1;
END;
RETURN @success;
END;
GO