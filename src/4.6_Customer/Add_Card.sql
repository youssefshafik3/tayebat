go 
--Ahmed Walid 64-25319 S3
create procedure Add_Card

@customer_id int, @card_no char(16), @card_holder_name varchar(100), @expiration_date date
as
begin

if (@customer_id is null or @card_no is null or @card_holder_name is null or @expiration_date is null)
or (@card_no like '%[^0-9]%' ) or (@expiration_date< cast(GETDATE() as date)) 
or (@card_holder_name= '')
return -1;

if exists (select 1 from card where customer_id = @customer_id and card_no = @card_no)
return -2;


insert into Card (customer_id, card_no, card_holder_name, expiration_date)
values (@customer_id, @card_no, @card_holder_name, @expiration_date)
return 0;
end
go