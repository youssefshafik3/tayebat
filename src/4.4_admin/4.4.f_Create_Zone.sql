-- Youssef Sameh 64-10650
CREATE PROCEDURE Create_Zone
    @zone_name VARCHAR(50), @delivery_fee DECIMAL(10,2), @super_admin_id INT
AS
    INSERT INTO Zone (zone_name, delivery_fee)
    VALUES (@zone_name, @delivery_fee);
GO
