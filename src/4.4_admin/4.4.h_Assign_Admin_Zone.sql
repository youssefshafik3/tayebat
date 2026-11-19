-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Assign_Admin_Zone
@admin_id INT,@zone_id INT,@super_admin_id INT
AS
BEGIN
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@super_admin_id AND(A.role='Super Admin' OR A.role IS NULL))
BEGIN
RETURN -3;
END;
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id AND A.role='Zone Admin')
BEGIN
RETURN -1;
END;
IF NOT EXISTS(SELECT 1 FROM Zone Z WHERE Z.zone_id=@zone_id)
BEGIN
RETURN -1;
END;
UPDATE Admin
SET zone_id=@zone_id WHERE admin_id=@admin_id;
RETURN 0;
END;
GO