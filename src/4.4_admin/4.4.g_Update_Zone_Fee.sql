-- Youssef Sameh 64-10650
CREATE PROCEDURE Update_Zone_Fee
    @zone_id INT, @new_fee DECIMAL(10,2), @super_admin_id INT
AS
    UPDATE Zone
    SET delivery_fee = @new_fee
    WHERE zone_id = @zone_id;
GO
