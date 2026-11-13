GO
CREATE PROCEDURE Update_Business_Info
@business_id INT, @opening_hour TIME, @closing_hour TIME, @phone CHAR(11), @link_website VARCHAR(255)
AS
BEGIN

IF @business_id NOT IN (SELECT business_id FROM Business)
BEGIN
RETURN -1;
END

UPDATE Business 
SET Business.link_website = @link_website,
Business.opening_hour = @opening_hour,
Business.closing_hour = @closing_hour
WHERE Business.business_id = @business_id;

INSERT INTO Business_Phone (business_id,phone)
VALUES (@business_id, @phone);
RETURN 0;

END
GO