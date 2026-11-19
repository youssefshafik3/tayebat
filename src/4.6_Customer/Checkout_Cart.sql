go 
--Ahmed Walid 64-25319 s3
create procedure Checkout_Cart
@cart_id int, @voucher_id int, @payment_method varchar(20), @card_id int
as
begin

if @cart_id is null or @payment_method is null or @payment_method not in('Cash','Card','Wallet')
return -1;

declare @customer_id int,@address_id int,@status varchar(20),@zone_id int, @is_active bit

select @customer_id =c.customer_id,@address_id=c.address_id,@status=c.status
from cart c where @cart_id=c.cart_id

select @zone_id=zone_id, @is_active=is_active from cart c inner join address a
on a.address_id=c.address_id where c.cart_id = @cart_id and a.customer_id = c.customer_id

if exists (select * from users where user_id=@customer_id and account_status='Blacklisted')
return -3;

if @is_active is null or @is_active=0 or @status!='Active'
or exists(select * from cartitem ci inner join product p on p.product_id=ci.product_id
inner join business b on p.business_id=b.business_id
where ci.cart_id=@cart_id and(p.is_available=0 or b.status!='Active') )
return -4;

if exists(select * from cartitem ci inner join product p on p.product_id=ci.product_id
inner join business b on p.business_id=b.business_id
where ci.cart_id=@cart_id and @zone_id!=b.zone_id)
return -5;

if not exists(select* from cartitem ca where ca.cart_id=@cart_id) 
return -9;

if @voucher_id is not null and not exists(select * from voucher v 
where @voucher_id=v.voucher_id and @customer_id=v.customer_id 
and v.status='Unused' and v.expiry_date>=cast (getdate() as date) )
return -1;

declare @subtotal decimal(10,2),@discount decimal(10,2),@fees decimal(10,2),@total decimal(10,2)


select @subtotal=(select sum(c.quantity*(p.price-p.discount_amount))from cartitem c 
inner join product p on p.product_id=c.product_id
where @cart_id=c.cart_id)
select @discount =dbo.Calculate_Voucher_Discount(@voucher_id, @subtotal)
select @fees=(select max(z.delivery_fee) * count(distinct b.business_id) from cartitem ci inner join product p on p.product_id=ci.product_id
inner join business b on p.business_id=b.business_id
inner join zone z on b.zone_id=z.zone_id
where ci.cart_id=@cart_id and z.zone_id=@zone_id)
select @total=@subtotal+@fees-@discount

declare @wallet decimal(10,2)
select @wallet=(select wallet_balance from customer where customer_id=@customer_id)

if @payment_method='Wallet' and @wallet <@total
return -7;

declare @isValidCard bit
select @isValidCard=1

if @card_id is null or not exists(select *from card where card_id=@card_id and customer_id =@customer_id)
select @isValidCard=0


if @isValidCard=0 and @payment_method='Card'
return -7;


begin try
    begin transaction


update c
set c.unit_price = p.price-p.discount_amount
from cartitem c
inner join product p on p.product_id = c.product_id
where c.cart_id = @cart_id

insert into orders(order_date,cart_id,zone_id,voucher_id,total_amount,discount_amount)
values(getdate(),@cart_id,@zone_id,@voucher_id,@total,@discount)

declare @order_id int 
select @order_id= (select order_id from orders where cart_id=@cart_id)

Declare @zone_fee decimal(10,2)
select @zone_fee = delivery_fee from zone where zone_id = @zone_id

insert into suborder(total_price, delivery_fee, order_id, business_id)
select 
sum(ci.quantity * ci.unit_price) as total_price,
@zone_fee as delivery_fee,
@order_id as order_id,
b.business_id as business_id

from cartitem ci inner join product p on p.product_id=ci.product_id
inner join business b on p.business_id=b.business_id
where ci.cart_id=@cart_id
group by b.business_id


update voucher set status = 'Used' where voucher_id = @voucher_id

commit
return 0
end try
begin catch
    if @@trancount > 0 rollback
    return -1 
end catch

end
go

