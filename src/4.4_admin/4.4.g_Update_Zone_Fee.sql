-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Update_Zone_Fee
    @zone_id INT, @new_fee DECIMAL(10,2), @super_admin_id INT
AS

    IF @super_admin_id IS NULL
        RETURN -1;

    IF NOT EXISTS (SELECT admin_id
                   FROM Admin
                   WHERE role = 'Super Admin'
                   AND admin_id = @super_admin_id)
        RETURN -3;

    IF NOT EXISTS (SELECT zone_id
                   FROM Zone
                   WHERE zone_id = @zone_id)
        RETURN -1;

    IF @new_fee IS NULL OR @new_fee < 0 
        RETURN -1;

    UPDATE Zone
    SET delivery_fee = @new_fee
    WHERE zone_id = @zone_id;

    RETURN 0;
GO
