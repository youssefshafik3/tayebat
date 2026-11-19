go
--Ahmed Walid 64-25319 s3
create procedure Remove_From_Cart 
@cart_id int, @product_id int
as
begin
if @cart_id is null or @product_id is null
return -1;

if exists (select *from cart where @cart_id=cart_id and status !='Active') or 
exists (select * from cart c inner join address a on a.address_id =c.address_id 
where @cart_id=c.cart_id and a.is_active=0)
return -4;

if not exists(select* from CartItem
where cart_id=@cart_id and @product_id=product_id)
return -1;

delete from CartItem where cart_id=@cart_id and @product_id=product_id
return 0;


end
go