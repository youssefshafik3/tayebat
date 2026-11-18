-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Create_Admin 
@first_name VARCHAR(30),@middle_name VARCHAR(30),@last_name VARCHAR(30),@username VARCHAR(30),@password VARCHAR(30),@email VARCHAR(100),@phone CHAR(11),@dob DATE,@role VARCHAR(20),@zone_id INT,@super_admin_id INT
AS
BEGIN
IF(@role IS NOT NULL AND @role <>'Super Admin' AND @role <>'Zone Admin')
BEGIN
RETURN -1;
END;

IF(@first_name IS NULL  OR @last_name IS NULL OR @username IS NULL OR @password IS NULL OR @email IS NULL OR @phone IS NULL OR LEN(@phone)<>11 OR @phone LIKE '%[^0-9]%' OR @dob>=CAST(GETDATE() AS DATE ) OR @email NOT LIKE '%_@_%._%' OR @email LIKE '% %')
BEGIN
RETURN -1;
END;
IF NOT EXISTS (SELECT 1 FROM Users U WHERE U.user_id=@super_admin_id)
BEGIN
RETURN -1;
END;
IF((@role IS NULL OR @role='Super Admin') AND @zone_id IS NOT NULL)
BEGIN
RETURN -1;
END;
IF(@role='Zone Admin' AND (@zone_id IS NULL OR NOT EXISTS(SELECT 1 FROM Zone Z WHERE Z.zone_id=@zone_id)))
BEGIN
RETURN -1;
END;
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@super_admin_id AND (A.role='Super Admin'  OR A.role IS NULL))
BEGIN
RETURN -3;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.email=@email OR U.username=@username)
BEGIN
RETURN -2;
END;
IF(@role IS NULL)
BEGIN
SET @role='Super Admin';
END;
INSERT INTO Users(first_name,middle_name,last_name,username,password,email,dob) VALUES (@first_name,@middle_name,@last_name,@username,@password,@email,@dob);
DECLARE @user_id INT=SCOPE_IDENTITY();
INSERT INTO Admin(admin_id,role,zone_id) VALUES(@user_id,@role,@zone_id);
INSERT INTO User_Phone(user_id,phone) VALUES(@user_id,@phone);
RETURN 0;
END;
GO