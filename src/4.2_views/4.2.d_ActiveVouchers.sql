-- MARTIN JOSEPH 64-27346
CREATE VIEW ActiveVouchers
AS
SELECT V.voucher_id,V.promo_code,V.customer_id,V.is_percentage,V.amount,V.expiry_date FROM Voucher V WHERE V.status='Unused' AND V.expiry_date>=CAST(GETDATE() AS DATE);
GO