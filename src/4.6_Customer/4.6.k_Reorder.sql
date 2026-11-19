go 
--Ahmed Walid 64-25319 s3
create procedure Reorder
@order_id int, @address_id int 
as
begin
declare @customer_id int
select @customer_id =(select c.customer_id from orders o inner join cart c on c.cart_id=o.cart_id 
where @order_id= o.order_id)
declare @cart_id int
select @cart_id =(select c.cart_id from orders o inner join cart c on c.cart_id=o.cart_id
where o.order_id=@order_id)

if @order_id is null or @address_id is null
return-1;
iF @customer_id IS NULL RETURN -1;
if exists(select* from users where @customer_id=user_id and account_status='Blacklisted')
or not exists(Select * from address a where a.customer_id=@customer_id and a.address_id=@address_id)
return -3;

if not exists(select* from orders o inner join address a on a.zone_id=o.zone_id
where @address_id=a.address_id and @order_id=o.order_id)
return -5;

if exists(select * from cart c 
where customer_id = @customer_id and address_id = @address_id and status = 'Active')
return -2;

if not exists(select * from orders o inner join cartitem c on c.cart_id=o.cart_id
inner join product p on p.product_id=c.product_id
inner join business b on p.business_id = b.business_id
where p.is_available=1 and o.order_id=@order_id and b.status='Active')
return -9;

update address set is_active= case when @address_id =address_id then 1 else 0 end
where @customer_id=customer_id

insert into cart (customer_id,address_id) values(@customer_id,@address_id)

declare @new_cart_id int
select @new_cart_id = cart_id from cart
where customer_id = @customer_id and address_id = @address_id and status = 'Active'

insert into cartitem(cart_id,product_id,quantity,notes)
select @new_cart_id,p.product_id,ci.quantity,ci.notes from cartitem ci
inner join orders o on o.cart_id=ci.cart_id
inner join product p on p.product_id=ci.product_id
inner join business b on p.business_id = b.business_id
where p.is_available=1 and o.order_id=@order_id and b.status='Active'

return 0;

end
go