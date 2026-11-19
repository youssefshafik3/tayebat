--Ziad Yasser Ibrahim 65-33790

GO
Create Procedure Register_Business
@partner_id INT, @name VARCHAR(100), @description VARCHAR(255),
@link_website VARCHAR(255), @zone_id INT, @opening_hour TIME, @closing_hour TIME, @expected_delivery_time INT,
@phone CHAR(11), @business_type VARCHAR(20), @cuisine_type VARCHAR(50), @food_category VARCHAR(50), @pharmacy_type VARCHAR(50)
AS
BEGIN

IF @partner_id IS NULL OR NOT EXISTS(SELECT * FROM Partner P WHERE P.partner_id = @partner_id)
RETURN -1;

IF EXISTS(SELECT * FROM Users U WHERE U.user_id = @partner_id AND U.account_status = 'Blacklisted')
RETURN -3;

IF @name IS NULL OR LTRIM(RTRIM(@name)) = '' OR
@zone_id IS NULL OR @zone_id NOT IN (SELECT zone_id FROM Zone)
OR @opening_hour IS NULL OR @closing_hour IS NULL OR @expected_delivery_time IS NULL 
OR @expected_delivery_time <= 0 OR
@phone IS NULL OR LEN(@phone) <> 11 OR @phone LIKE '%[^0123456789]%' 
RETURN -1;

IF @business_type = 'Pharmacy'
BEGIN
IF @pharmacy_type IS NULL OR LTRIM(RTRIM(@pharmacy_type)) = ''
OR @cuisine_type IS NOT NULL OR @food_category IS NOT NULL
RETURN -1;
END

ELSE IF @business_type = 'Restaurant'
BEGIN
IF @cuisine_type IS NULL OR LTRIM(RTRIM(@cuisine_type)) = ''
OR @food_category IS NULL OR LTRIM(RTRIM(@food_category)) = ''
OR @pharmacy_type IS NOT NULL 
RETURN -1;
END

ELSE
RETURN -1;

declare @business_id INT
declare @business_status VARCHAR(20)

SELECT @business_id = B.business_id , @business_status = B.status
FROM Business B 
WHERE B.partner_id = @partner_id;

IF @business_id IS NOT NULL AND @business_status <> 'Rejected'
RETURN -2;

IF @business_id IS NULL 
BEGIN
INSERT INTO Business (name, description, link_website, opening_hour, closing_hour, 
expected_delivery_time, status , suspension_reason, partner_id , zone_id)
VALUES (@name, @description, @link_website, @opening_hour, @closing_hour , 
@expected_delivery_time, 'Pending', NULL, @partner_id, @zone_id);
SET @business_id = SCOPE_IDENTITY();
END
ELSE 
BEGIN
UPDATE Business 
SET Business.name = @name,
Business.description = @description,
Business.link_website = @link_website,
Business.opening_hour = @opening_hour,
Business.closing_hour = @closing_hour,
Business.expected_delivery_time = @expected_delivery_time,
Business.status = 'Pending',
Business.suspension_reason = NULL,
Business.partner_id = @partner_id,
Business.zone_id = @zone_id
WHERE Business.business_id = @business_id;

DELETE FROM Business_Phone
WHERE Business_Phone.business_id = @business_id;

DELETE FROM Restaurant 
WHERE Restaurant.business_id = @business_id;

DELETE FROM Pharmacy 
WHERE Pharmacy.business_id = @business_id;
END

INSERT Business_Phone (business_id,phone)
VALUES (@business_id, @phone);

IF @business_type = 'Restaurant'
BEGIN
INSERT INTO Restaurant (business_id, cuisine_type, food_category)
VALUES (@business_id, @cuisine_type, @food_category);
END 

ELSE 
BEGIN
INSERT INTO Pharmacy(business_id, pharmacy_type)
VALUES (@business_id, @pharmacy_type);
END
RETURN 0;
END 
GO 