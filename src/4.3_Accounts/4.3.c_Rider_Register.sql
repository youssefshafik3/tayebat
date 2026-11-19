-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Rider_Register
@first_name VARCHAR(30),@middle_name VARCHAR(30),@last_name VARCHAR(30),@username VARCHAR(30),@password VARCHAR(30),@email VARCHAR(100),@phone CHAR(11),@dob DATE,@vehicle_type VARCHAR(30),@plate_no VARCHAR(15),@license_no varchar(20),@zone_id INT
AS
BEGIN 
IF (@first_name IS NULL  OR @last_name IS NULL OR @username IS NULL OR @password IS NULL OR @email IS NULL OR @phone IS NULL  OR @vehicle_type IS NULL OR @plate_no IS NULL OR @license_no IS NULL OR @zone_id IS NULL OR LEN(@phone)<>11 OR @phone LIKE '%[^0-9]%' OR @dob>=CAST(GETDATE() AS DATE ) OR @email NOT LIKE '%_@_%._%' OR @email LIKE '% %')
BEGIN 
RETURN -1;
END;
IF NOT EXISTS(SELECT 1 FROM Zone Z WHERE Z.zone_id=@zone_id)
BEGIN
RETURN -1;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.email=@email OR U.username=@username) OR EXISTS (SELECT 1 FROM Rider WHERE plate_no=@plate_no OR license_no=@license_no)
BEGIN
RETURN -2;
END;
INSERT INTO Users(first_name,middle_name,last_name,username,password,email,dob) VALUES (@first_name,@middle_name,@last_name,@username,@password,@email,@dob);
DECLARE @user_id INT=SCOPE_IDENTITY();
INSERT INTO Rider(rider_id,vehicle_type,plate_no,license_no,is_available,zone_id) VALUES(@user_id,@vehicle_type,@plate_no,@license_no,1,@zone_id);
INSERT INTO User_Phone(user_id,phone) VALUES(@user_id,@phone);
RETURN 0;
END;
GO