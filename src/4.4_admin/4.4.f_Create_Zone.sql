-- Youssef Sameh 64-10650
CREATE PROCEDURE Create_Zone
    @zone_name VARCHAR(50), @delivery_fee DECIMAL(10,2), @super_admin_id INT
AS
    IF @super_admin_id IS NULL
        RETURN -1;
    IF NOT EXISTS (SELECT admin_id
                   FROM Admin
                   WHERE role = 'Super Admin'
                   AND admin_id = @super_admin_id)
        RETURN -3;
    IF @zone_name IS NULL OR LTRIM(RTRIM(@zone_name)) = '' OR @delivery_fee IS NULL OR @delivery_fee < 0 
        RETURN -1;
    IF @zone_name IN (SELECT zone_name
                      FROM Zone)
        RETURN -2;


    INSERT INTO Zone (zone_name, delivery_fee)
    VALUES (@zone_name, @delivery_fee);
    RETURN 0;
GO
