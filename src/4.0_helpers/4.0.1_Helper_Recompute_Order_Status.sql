-- Youssef Sameh 64-10650
CREATE PROCEDURE Helper_Recompute_Order_Status
    @order_id INT
AS
    
    UPDATE Orders
    SET status = CASE WHEN (NOT EXISTS (SELECT S.status
                                    FROM SubOrder S
                                    WHERE S.order_id = @order_id
                                    AND S.status IN ('Placed', 'Assigned', 'Picked Up','Delivered'))) THEN 'Cancelled'
                      WHEN (NOT EXISTS (SELECT S.status
                                    FROM SubOrder S
                                    WHERE S.order_id = @order_id
                                    AND S.status IN ('Placed', 'Assigned', 'Picked Up'))) THEN 'Delivered'
                      WHEN (EXISTS (SELECT S.status
                                    FROM SubOrder S
                                    WHERE S.order_id = @order_id
                                    AND S.status IN ('Delivered','Picked Up'))) THEN 'In Progress'
                      ELSE 'Placed'
                      END
    WHERE order_id = @order_id

    RETURN 0;
GO
