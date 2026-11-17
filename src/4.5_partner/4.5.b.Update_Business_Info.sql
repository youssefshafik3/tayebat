GO
CREATE PROCEDURE Update_Business_Info
@business_id INT, @opening_hour TIME, @closing_hour TIME, @phone CHAR(11), @link_website VARCHAR(255)
AS
BEGIN

IF @business_id IS NULL OR @business_id NOT IN (SELECT business_id FROM Business) OR @opening_hour IS NULL
OR @closing_hour IS NULL OR @phone IS NULL OR LEN(@phone) <> 11 OR @phone LIKE '%[^0123456789]%' 
RETURN -1;

IF EXISTS(SELECT * FROM Business B INNER JOIN Users U ON B.partner_id = U.user_id WHERE B.business_id = @business_id
      AND U.account_status = 'Blacklisted')
RETURN -3;

IF EXISTS(SELECT * FROM Business_Phone B WHERE B.business_id = @business_id AND B.phone = @phone)
RETURN -2;

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