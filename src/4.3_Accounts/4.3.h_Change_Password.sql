-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Change_Password 
@user_id INT,@old_password VARCHAR(30),@new_password VARCHAR(30),@new_password_repeat VARCHAR(30),@success BIT OUTPUT
AS
BEGIN
SET @success=0;
IF(@new_password IS NULL OR @old_password IS NULL OR @new_password_repeat IS NULL)
BEGIN
RETURN -1;
END;

IF(@new_password <> @new_password_repeat)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@user_id)
BEGIN
RETURN -1;
END;

IF @old_password NOT IN(SELECT password FROM Users U WHERE U.user_id=@user_id)
BEGIN
RETURN -1;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@user_id AND U.password=@old_password)
BEGIN
UPDATE Users
SET password=@new_password WHERE user_id=@user_id;
SET @success=1;
END;
RETURN 0;
END;
GO