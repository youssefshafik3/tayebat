-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Approve_Business
@business_id INT,@admin_id INT
AS
BEGIN
IF NOT EXISTS (SELECT 1 FROM Business B WHERE B.business_id=@business_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id =@admin_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Admin A,Business B WHERE A.admin_id=@admin_id AND A.role='Zone Admin' AND B.business_id=@business_id AND A.zone_id <> B.zone_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Business B WHERE B.business_id=@business_id AND B.status<>'Pending')
BEGIN
RETURN -4;
END;

UPDATE Business
SET status='Active' WHERE business_id=@business_id;
RETURN 0;


END;
GO