GO
Create Procedure Register_Business
@partner_id INT, @name VARCHAR(100), @description VARCHAR(255),
@link_website VARCHAR(255), @zone_id INT, @opening_hour TIME, @closing_hour TIME, @expected_delivery_time INT,
@phone CHAR(11), @business_type VARCHAR(20), @cuisine_type VARCHAR(50), @food_category VARCHAR(50), @pharmacy_type VARCHAR(50)
AS
declare @numebr_of_business INT
SELECT @numebr_of_business = count(B.business_id)
FROM Business B 
RIGHT OUTER JOIN Partner P ON B.partner_id = P.partner_id
WHERE P.partner_id = @partner_id;

IF @numebr_of_business = 0
BEGIN
INSERT INTO Business (name, description, link_website, opening_hour, closing_hour, 
expected_delivery_time, status , suspension_reason, partner_id , zone_id)
VALUES (@name, @description, @link_website, @opening_hour, @closing_hour , 
@expected_delivery_time, 'Pending', NULL, @partner_id, @zone_id);
END

ELSE IF @numebr_of_business = 1
BEGIN
declare @business_id INT
declare @business_status VARCHAR(20)
SELECT @business_id = B.business_id, @business_status = B.business_status
FROM Business B
WHERE B.partner_id = @partner_id;

IF @business_status = 'Active' OR @business_status = 'Pending' OR @business_status = 'Suspended' 
BEGIN
Return -2;
END

IF @business_status = 'Rejected'
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

IF @business_type = 'Restaurant'
BEGIN
DELETE FROM Restaurant 
WHERE Restaurant.business_id = @business_id;
END 

ELSE IF @business_type = 'Pharmacy'
BEGIN
DELETE FROM Pharmacy 
WHERE Pharmacy.business_id = @business_id;
END
END
END

declare @business_id INT

SELECT @business_id = B.business_id
FROM Business B
WHERE B.partner_id = @partner_id;

INSERT Business_Phone (business_id,phone)
VALUES (@business_id, @phone);

IF @business_type = 'Restaurant'
BEGIN
INSERT INTO Restaurant (business_id, cuisine_type, food_category)
VALUES (@business_id, @cuisine_type, @food_category);
END 

ELSE IF @business_type = 'Pharmacy'
BEGIN
INSERT INTO Pharmacy(business_id, pharmacy_type)
VALUES (@business_id, @pharmacy_type);
END
GO 