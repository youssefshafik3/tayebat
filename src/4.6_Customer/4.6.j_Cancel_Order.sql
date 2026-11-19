go
--Ahmed Walid 64-25319 s3
create procedure Cancel_Order 
@order_id int 
as
begin
if @order_id is null
return -1;

if exists (select * from orders where @order_id=order_id and status='Cancelled')
or exists(select * from suborder s inner join orders o on o.order_id=s.order_id
where @order_id=o.order_id and s.status in('Picked Up','Delivered'))
return -4;

declare @v_id int 
select @v_id=(select v.voucher_id from orders o inner join voucher v on v.voucher_id=o.voucher_id
where o.order_id=@order_id and v.status='Used')

if @v_id is not null
begin
update voucher set status='Unused' where voucher_id=@v_id
update orders set voucher_id = null where order_id=@order_id
end

declare @refund decimal(10,2)
declare @tot_amt decimal(10,2)
declare @tot_rfd decimal(10,2)
declare @method varchar(20)
select @tot_amt = p.amount,@tot_rfd = p.refunded_amount,@method=p.method
from orders o
inner join payment p on p.order_id=o.order_id
where @order_id=o.order_id

select @refund=@tot_amt-@tot_rfd

declare @customer_id int
select @customer_id=(select c.customer_id from orders o inner join cart c on c.cart_id=o.cart_id
where o.order_id=@order_id)
if @method != 'Cash'
update customer set customer.wallet_balance=@refund+customer.wallet_balance where customer_id=@customer_id

update payment set refunded_amount = refunded_amount + @refund 
where payment.order_id=@order_id

update suborder set status = 'Cancelled'
where order_id = @order_id and status in ('Placed', 'Assigned')
update orders set status='Cancelled' where order_id=@order_id
return 0;

end
go