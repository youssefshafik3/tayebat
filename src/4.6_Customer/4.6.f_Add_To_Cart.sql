go
--Ahmed Walid 64-25319 s3
create procedure Add_To_Cart
@cart_id int, @product_id int, @quantity int, @notes varchar(255) 
as
begin
if  @cart_id is null or @product_id is null or @quantity is null or @quantity<=0 
return -1;

if not exists(select * from cart where cart_id=@cart_id and status='Active')
or exists (select * from cart c inner join address a on a.address_id =c.address_id 
where @cart_id=c.cart_id and a.is_active=0)
return -4;

declare @cartzone int
declare @businesszone int

select @cartzone =(select a.zone_id from cart c inner join address a on a.address_id=c.address_id where c.cart_id=@cart_id)
select @businesszone= (select b.zone_id from product p inner join business b on b.business_id=p.business_id where p.product_id=@product_id)

if @cartzone!=@businesszone
return -5;

declare @myprodquant int
declare @prodexists bit
select @prodexists= case when exists (select * from cartitem where cart_id=@cart_id and @product_id=product_id) then 1 else 0 end
select @myprodquant= (select quantity from cartitem where cart_id=@cart_id and @product_id=product_id)

if (@prodexists=1 and @quantity+@myprodquant>10) or (@quantity>10 and @prodexists=0)
return -6;

if @prodexists=1 
update cartitem set quantity=@quantity+@myprodquant where cart_id=@cart_id and @product_id=product_id

if @notes is not null and @prodexists=1 
update cartitem set notes=@notes where cart_id=@cart_id and @product_id=product_id

if @prodexists=0
insert into cartitem(cart_id,product_id,notes,quantity) values(@cart_id,@product_id,@notes,@quantity)

return 0;

end
go