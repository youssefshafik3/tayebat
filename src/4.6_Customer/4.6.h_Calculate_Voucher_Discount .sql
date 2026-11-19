go
--Ahmed Walid 64-25319 s3
create function dbo.Calculate_Voucher_Discount(@voucher_id int, @order_subtotal decimal(10,2))
returns decimal(10,2)
as
begin
declare @amount decimal(10,2), @is_pct bit, @status varchar(20), @expiry date
select @amount = amount, @is_pct = is_percentage, @status = status, @expiry = expiry_date
from voucher where voucher_id = @voucher_id

if @voucher_id is null or @status is null or @status != 'Unused' or @expiry < cast(getdate() as date)
return 0;

if @order_subtotal is null or @order_subtotal<0
return -1;

if @is_pct=1
return (@amount*@order_subtotal/100);

if @amount>@order_subtotal
return @order_subtotal;

return @amount;



end
go