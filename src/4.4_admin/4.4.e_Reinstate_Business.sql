-- Youssef Sameh 64-10650
CREATE PROCEDURE Reinstate_Business
    @business_id INT, @super_admin_id INT
AS
    DECLARE @admin_role VARCHAR(20);

    SELECT @admin_role = role
    FROM Admin
    WHERE admin_id = @admin_id;

    IF @admin_role = 'Zone Admin'
    BEGIN
        RETURN -3;
    END

    DECLARE @business_status VARCHAR(20);

    SELECT @business_status = status
    FROM Business
    WHERE business_id = @business_id;
    
    IF @business_status <> 'Suspended'
    BEGIN
        RETURN -4;
    END

    UPDATE Business
    SET status = 'Active', reason = NULL
    WHERE business_id = @business_id;

    RETURN 0;
GO