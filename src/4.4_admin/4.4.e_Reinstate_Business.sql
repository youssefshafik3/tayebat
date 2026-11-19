-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Reinstate_Business
    @business_id INT, @super_admin_id INT
AS

    IF @super_admin_id IS NULL
        RETURN -1;
    IF NOT EXISTS (SELECT admin_id
                   FROM Admin
                   WHERE role = 'Super Admin'
                   AND admin_id = @super_admin_id)
        RETURN -3;

    IF @business_id IS NULL
        RETURN -1;

    IF NOT EXISTS (SELECT business_id
                   FROM Business
                   WHERE business_id = @business_id)
        RETURN -1;

    DECLARE @business_status VARCHAR(20);

    SELECT @business_status = status
    FROM Business
    WHERE business_id = @business_id;
    
    IF @business_status <> 'Suspended'
    BEGIN
        RETURN -4;
    END

    UPDATE Business
    SET status = 'Active', suspension_reason  = NULL
    WHERE business_id = @business_id;

    RETURN 0;

GO