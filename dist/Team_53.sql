

-- Youssef Sameh 64-10650
CREATE DATABASE LocalDeliveryMarketplace_Team_53;
GO
USE LocalDeliveryMarketplace_Team_53;
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE createAllTables
AS

    CREATE TABLE Zone (
        zone_id INT IDENTITY(1,1) PRIMARY KEY,
        zone_name VARCHAR(50) NOT NULL UNIQUE,
        delivery_fee DECIMAL(10, 2) NOT NULL,
        CONSTRAINT chck_del_fee_not_neg CHECK (delivery_fee>=0)
    );

    CREATE TABLE Users (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        first_name VARCHAR(30) NOT NULL,
        middle_name VARCHAR(30),
        last_name VARCHAR(30) NOT NULL,
        username VARCHAR(30) NOT NULL UNIQUE,
        password VARCHAR(30) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        dob DATE,
        account_status VARCHAR(20) NOT NULL DEFAULT 'Active'
    );

    CREATE TABLE User_Phone (
        user_id INT,
        phone CHAR(11),
        PRIMARY KEY (user_id, phone),
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
    );

    CREATE TABLE Admin (
        admin_id INT PRIMARY KEY,
        role VARCHAR(20) NOT NULL DEFAULT 'Super Admin',
        zone_id INT,
        FOREIGN KEY (admin_id) REFERENCES Users(user_id),
        FOREIGN KEY (zone_id) REFERENCES Zone(zone_id)
    );

    CREATE TABLE Partner (
        partner_id INT PRIMARY KEY,
        FOREIGN KEY (partner_id) REFERENCES Users(user_id)
    );

    CREATE TABLE Rider (
        rider_id INT PRIMARY KEY,
        vehicle_type VARCHAR(30) NOT NULL,
        plate_no VARCHAR(15) NOT NULL UNIQUE,
        license_no VARCHAR(20) NOT NULL UNIQUE,
        is_available BIT NOT NULL DEFAULT 1,
        zone_id INT NOT NULL,
        FOREIGN KEY (rider_id) REFERENCES Users(user_id),
        FOREIGN KEY (zone_id) REFERENCES Zone(zone_id)
    );

    CREATE TABLE Customer (
        customer_id INT PRIMARY KEY,
        wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        FOREIGN KEY (customer_id) REFERENCES Users(user_id),
        CONSTRAINT chk_balance_not_neg CHECK (wallet_balance >= 0)
    );

    CREATE TABLE Address (
        address_id INT IDENTITY(1,1) PRIMARY KEY,
        description VARCHAR(150) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        customer_id INT NOT NULL,
        zone_id INT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (zone_id) REFERENCES Zone(zone_id)
    );

    CREATE TABLE Card (
        card_id INT IDENTITY(1,1) PRIMARY KEY,
        card_no CHAR(16) NOT NULL,
        card_holder_name VARCHAR(100) NOT NULL,
        expiration_date DATE NOT NULL,
        customer_id INT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        CONSTRAINT UQ_Customer_Card UNIQUE (customer_id, card_no)
    );

    CREATE TABLE Business (
        business_id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        link_website VARCHAR(255),
        opening_hour TIME NOT NULL,
        closing_hour TIME NOT NULL,
        expected_delivery_time INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        suspension_reason VARCHAR(255),
        partner_id INT NOT NULL UNIQUE,
        zone_id INT NOT NULL,
        FOREIGN KEY (partner_id) REFERENCES Partner(partner_id),
        FOREIGN KEY (zone_id) REFERENCES Zone(zone_id),
        CONSTRAINT chk_exp_del_time_pos CHECK (expected_delivery_time>0)
    );

    CREATE TABLE Business_Phone (
        business_id INT,
        phone CHAR(11),
        PRIMARY KEY (business_id, phone),
        FOREIGN KEY (business_id) REFERENCES Business(business_id)
    );

    CREATE TABLE Restaurant (
        business_id INT PRIMARY KEY,
        cuisine_type VARCHAR(50) NOT NULL,
        food_category VARCHAR(50) NOT NULL,
        FOREIGN KEY (business_id) REFERENCES Business(business_id)
    );

    CREATE TABLE Pharmacy (
        business_id INT PRIMARY KEY,
        pharmacy_type VARCHAR(50) NOT NULL,
        FOREIGN KEY (business_id) REFERENCES Business(business_id)
    );

    CREATE TABLE Blacklist (
        customer_id INT PRIMARY KEY,
        admin_id INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)
    );

    CREATE TABLE Product (
        product_id INT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_available BIT NOT NULL DEFAULT 1,
        business_id INT NOT NULL,
        FOREIGN KEY (business_id) REFERENCES Business(business_id),
        CONSTRAINT chk_price_pos CHECK (price > 0),
        CONSTRAINT chk_discount_range CHECK (discount_amount >=0 AND discount_amount<=.5*price)
    );

    CREATE TABLE Favorite_Business (
        customer_id INT,
        business_id INT,
        PRIMARY KEY (customer_id, business_id),
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (business_id) REFERENCES Business(business_id)
    );

    CREATE TABLE Favorite_Product (
        customer_id INT,
        product_id INT,
        PRIMARY KEY (customer_id, product_id),
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id)
    );

    CREATE TABLE Voucher (
        voucher_id INT IDENTITY(1,1) PRIMARY KEY,
        promo_code VARCHAR(30) NOT NULL UNIQUE,
        is_percentage BIT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        expiry_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Unused',
        customer_id INT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        CONSTRAINT chk_amount_pos CHECK (amount>0)
    );

    CREATE TABLE Cart (
        cart_id INT IDENTITY(1,1) PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        customer_id INT NOT NULL,
        address_id INT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (address_id) REFERENCES Address(address_id)
    );

    CREATE TABLE CartItem (
        cart_id INT,
        product_id INT,
        quantity INT NOT NULL,
        notes VARCHAR(255),
        unit_price DECIMAL(10, 2),
        PRIMARY KEY (cart_id, product_id),
        FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id),
        CONSTRAINT chk_quantity_range CHECK (quantity BETWEEN 1 AND 10)
    );

    CREATE TABLE Orders (
        order_id INT IDENTITY(1,1) PRIMARY KEY,
        order_date DATETIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Placed',
        discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        cart_id INT NOT NULL UNIQUE,
        zone_id INT NOT NULL,
        voucher_id INT,
        FOREIGN KEY (cart_id) REFERENCES Cart(cart_id),
        FOREIGN KEY (zone_id) REFERENCES Zone(zone_id),
        FOREIGN KEY (voucher_id) REFERENCES Voucher(voucher_id)
    );

    CREATE TABLE SubOrder (
        suborder_id INT IDENTITY(1,1) PRIMARY KEY,
        status VARCHAR(20) NOT NULL DEFAULT 'Placed',
        total_price DECIMAL(10, 2) NOT NULL,
        delivery_fee DECIMAL(10, 2) NOT NULL,
        order_id INT NOT NULL,
        business_id INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id),
        FOREIGN KEY (business_id) REFERENCES Business(business_id),
        CONSTRAINT UQ_Order_Business UNIQUE (order_id, business_id)
    );

    CREATE TABLE Delivery (
        delivery_id INT IDENTITY(1,1) PRIMARY KEY,
        assigned_at DATETIME NOT NULL,
        picked_up_at DATETIME,
        delivered_at DATETIME,
        tracking_time INT,
        rider_rating INT,
        suborder_id INT NOT NULL UNIQUE,
        rider_id INT NOT NULL,
        FOREIGN KEY (suborder_id) REFERENCES SubOrder(suborder_id),
        FOREIGN KEY (rider_id) REFERENCES Rider(rider_id),
        CONSTRAINT chk_rider_rating_range CHECK (rider_rating BETWEEN 1 AND 5)
    );

    CREATE TABLE Payment (
        payment_id INT IDENTITY(1,1) PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'EGP',
        method VARCHAR(20) NOT NULL,
        transaction_date DATETIME NOT NULL,
        refunded_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        order_id INT NOT NULL UNIQUE,
        card_id INT,
        FOREIGN KEY (order_id) REFERENCES Orders(order_id),
        FOREIGN KEY (card_id) REFERENCES Card(card_id),
        CONSTRAINT chk_refunded CHECK (refunded_amount <= amount)
    );

    CREATE TABLE Feedback (
        feedback_id INT IDENTITY(1,1) PRIMARY KEY,
        headline VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        rating INT NOT NULL,
        feedback_date DATETIME NOT NULL DEFAULT GETDATE(),
        suborder_id INT NOT NULL UNIQUE,
        FOREIGN KEY (suborder_id) REFERENCES SubOrder(suborder_id),
        CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5) 
    );

    RETURN 0; 
GO



EXEC createAllTables;
GO

-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Helper_Recompute_Order_Status
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




-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE dropAllTables
AS
    DROP TABLE IF EXISTS Feedback;
    DROP TABLE IF EXISTS Payment;
    DROP TABLE IF EXISTS Delivery;
    DROP TABLE IF EXISTS Pharmacy;
    DROP TABLE IF EXISTS Restaurant;
    DROP TABLE IF EXISTS Card;
    DROP TABLE IF EXISTS SubOrder;
    DROP TABLE IF EXISTS Rider;
    DROP TABLE IF EXISTS Orders;
    DROP TABLE IF EXISTS CartItem;
    DROP TABLE IF EXISTS Cart;
    DROP TABLE IF EXISTS Voucher;
    DROP TABLE IF EXISTS Favorite_Business;
    DROP TABLE IF EXISTS Favorite_Product;
    DROP TABLE IF EXISTS Product;
    DROP TABLE IF EXISTS Address;
    DROP TABLE IF EXISTS Business_Phone;
    DROP TABLE IF EXISTS Business;
    DROP TABLE IF EXISTS Blacklist;
    DROP TABLE IF EXISTS Customer;
    DROP TABLE IF EXISTS Partner;
    DROP TABLE IF EXISTS User_Phone;
    DROP TABLE IF EXISTS Admin;
    DROP TABLE IF EXISTS Users;
    DROP TABLE IF EXISTS Zone;

    RETURN 0; 
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE dropAllProceduresFunctionsViews
AS

    DROP PROCEDURE IF EXISTS Helper_Recompute_Order_Status, createAllTables, dropAllTables, Suspend_Business, Reinstate_Business, Create_Zone, Update_Zone_Fee;
    DROP FUNCTION IF EXISTS dbo.ZoneOrderReport, dbo.Daily_Revenue_Report;
    DROP VIEW IF EXISTS BusinessesPerZone;

    RETURN 0;
GO


--Ziad Yasser Ibrahim 65-33790

CREATE VIEW allBusinessProfiles
AS
SELECT B.business_id, B.name AS business_name, CASE WHEN R.business_id IS NOT NULL THEN 'Restaurant'
WHEN P.business_id IS NOT NULL THEN 'Pharmacy' END AS business_type, 
Z.zone_name,(U.first_name + ' ' + U.last_name) AS partner_name,
status, opening_hour, closing_hour
FROM Business B 
INNER JOIN Users U ON B.partner_id = U.user_id
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
LEFT JOIN Restaurant R ON B.business_id = R.business_id
LEFT JOIN Pharmacy P ON B.business_id = P.business_id
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER VIEW BusinessesPerZone AS
    SELECT Z.zone_id, Z.zone_name, COUNT(B.business_id) AS business_count
    FROM Zone Z LEFT JOIN Business B ON Z.zone_id = B.zone_id AND B.status = 'Active'
    GROUP BY Z.zone_id, Z.zone_name;
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE VIEW BusinessRatingsSummary
AS

SELECT b.business_id,b.name AS business_name,
AVG(CAST(f.rating AS DECIMAL(10,2))) AS avg_rating,COUNT(f.rating) AS ratings_count

FROM Business b LEFT OUTER JOIN 
(SubOrder so LEFT OUTER JOIN Feedback f ON so.suborder_id=f.suborder_id)
ON b.business_id = so.business_id

GROUP BY b.business_id , b.name


GO


-- MARTIN JOSEPH 64-27346
CREATE VIEW ActiveVouchers
AS
SELECT V.voucher_id,V.promo_code,V.customer_id,V.is_percentage,V.amount,V.expiry_date FROM Voucher V WHERE V.status='Unused' AND V.expiry_date>=CAST(GETDATE() AS DATE);
GO


--Ziad Yasser Ibrahim 65-33790

CREATE VIEW PendingBusinessApprovals
AS
SELECT B.business_id, B.name AS business_name, CASE WHEN R.business_id IS NOT NULL THEN 'Restaurant'
WHEN P.business_id IS NOT NULL THEN 'Pharmacy' END AS business_type,
Z.zone_name, (U.first_name + ' ' + U.last_name) AS partner_name
FROM Business B
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
INNER JOIN Users U ON B.partner_id = U.user_id
LEFT OUTER JOIN Restaurant R ON B.business_id = R.business_id
LEFT OUTER JOIN Pharmacy P ON B.business_id = P.business_id
WHERE B.status = 'Pending' 
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE VIEW RiderPerformanceSummary
AS
SELECT r.rider_id,CONCAT(u.first_name,' ',u.last_name) AS rider_name,z.zone_name ,
COUNT(d.delivery_id) AS completed_deliveries,
AVG(f.rating) AS avg_rating

FROM ((Rider r INNER JOIN Users u ON r.rider_id = u.user_id) INNER JOIN Zone z ON r.zone_id = z.zone_id)
	LEFT OUTER JOIN (Delivery d 
	INNER JOIN ((SELECT * FROM SubOrder WHERE status = 'Delivered') AS so
	LEFT OUTER JOIN Feedback f ON f.suborder_id = so.suborder_id)
	ON d.suborder_id = so.suborder_id) ON d.rider_id = r.rider_id
GROUP BY r.rider_id,u.first_name,u.last_name,z.zone_name
GO


--Ziad Yasser Ibrahim 65-33790

CREATE VIEW TopSellingProducts 
AS
SELECT TOP 10 P.product_id, P.name AS product_name,B.name AS business_name, CASE WHEN R.business_id IS NOT NULL 
THEN 'Restaurant' WHEN PH.business_id IS NOT NULL THEN 'Pharmacy' END AS business_type, SUM(CI.quantity) AS units_sold,
SUM(CI.quantity * CI.unit_price) AS total_revenue
FROM CartItem CI
INNER JOIN Orders O ON CI.cart_id = O.cart_id 
INNER JOIN Product P ON CI.product_id = P.product_id
INNER JOIN SubOrder S ON O.order_id = S.order_id AND S.business_id = P.business_id
INNER JOIN Business B ON P.business_id = B.business_id
LEFT OUTER JOIN Restaurant R ON B.business_id = R.business_id
LEFT OUTER JOIN Pharmacy PH ON B.business_id = PH.business_id
WHERE S.status <> 'Cancelled'
GROUP BY P.product_id, P.name, B.name, R.business_id, PH.business_id
ORDER BY units_sold DESC, P.product_id ASC
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE VIEW ZoneDeliveryPerformance
AS
SELECT z.zone_id,z.zone_name,
COUNT(d.delivery_id) AS delivery_count,
AVG(d.tracking_time) AS avg_tracking_time

FROM (Zone z LEFT OUTER JOIN Orders o ON z.zone_id = o.zone_id)
LEFT OUTER JOIN (Delivery d 
INNER JOIN (SELECT * FROM SubOrder WHERE status = 'Delivered') AS so ON d.suborder_id = so.suborder_id)
ON o.order_id = so.order_id
GROUP BY z.zone_id,z.zone_name
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Customer_Register
@first_name VARCHAR(30),@middle_name VARCHAR(30),@last_name VARCHAR(30),@username VARCHAR(30),@password VARCHAR(30),@email VARCHAR(100),@phone CHAR(11),@dob DATE
AS
BEGIN 
IF (@first_name IS NULL  OR @last_name IS NULL OR @username IS NULL OR @password IS NULL OR @email IS NULL OR @phone IS NULL OR LEN(@phone)<>11 OR @phone LIKE '%[^0-9]%' OR @dob>=CAST(GETDATE() AS DATE ) OR @email NOT LIKE '%_@_%._%' OR @email LIKE '% %')
BEGIN
RETURN -1;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.email=@email OR U.username=@username)
BEGIN
RETURN -2;
END;
INSERT INTO Users(first_name,middle_name,last_name,username,password,email,dob) VALUES (@first_name,@middle_name,@last_name,@username,@password,@email,@dob);
DECLARE @user_id INT=SCOPE_IDENTITY();
INSERT INTO Customer(customer_id,wallet_balance) VALUES(@user_id,0);
INSERT INTO User_Phone(user_id,phone) VALUES (@user_id,@phone);
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Partner_Register
@first_name VARCHAR(30),@middle_name VARCHAR(30),@last_name VARCHAR(30),@username VARCHAR(30),@password VARCHAR(30),@email VARCHAR(100),@phone CHAR(11),@dob DATE
AS
BEGIN 
IF (@first_name IS NULL  OR @last_name IS NULL OR @username IS NULL OR @password IS NULL OR @email IS NULL OR @phone IS NULL OR LEN(@phone)<>11 OR @phone LIKE '%[^0-9]%' OR @dob>=CAST(GETDATE() AS DATE ) OR @email NOT LIKE '%_@_%._%' OR @email LIKE '% %')
BEGIN
RETURN -1;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.email=@email OR U.username=@username)
BEGIN
RETURN -2;
END;
INSERT INTO Users(first_name,middle_name,last_name,username,password,email,dob) VALUES (@first_name,@middle_name,@last_name,@username,@password,@email,@dob);
DECLARE @user_id INT=SCOPE_IDENTITY();
INSERT INTO Partner(partner_id) VALUES(@user_id);
INSERT INTO User_Phone(user_id,phone) VALUES(@user_id,@phone);
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Rider_Register
@first_name VARCHAR(30),@middle_name VARCHAR(30),@last_name VARCHAR(30),@username VARCHAR(30),@password VARCHAR(30),@email VARCHAR(100),@phone CHAR(11),@dob DATE,@vehicle_type VARCHAR(30),@plate_no VARCHAR(15),@license_no varchar(20),@zone_id INT
AS
BEGIN 
IF (@first_name IS NULL  OR @last_name IS NULL OR @username IS NULL OR @password IS NULL OR @email IS NULL OR @phone IS NULL  OR @vehicle_type IS NULL OR @plate_no IS NULL OR @license_no IS NULL OR @zone_id IS NULL OR LEN(@phone)<>11 OR @phone LIKE '%[^0-9]%' OR @dob>=CAST(GETDATE() AS DATE ) OR @email NOT LIKE '%_@_%._%' OR @email LIKE '% %')
BEGIN 
RETURN -1;
END;
IF NOT EXISTS(SELECT 1 FROM Zone Z WHERE Z.zone_id=@zone_id)
BEGIN
RETURN -1;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.email=@email OR U.username=@username) OR EXISTS (SELECT 1 FROM Rider WHERE plate_no=@plate_no OR license_no=@license_no)
BEGIN
RETURN -2;
END;
INSERT INTO Users(first_name,middle_name,last_name,username,password,email,dob) VALUES (@first_name,@middle_name,@last_name,@username,@password,@email,@dob);
DECLARE @user_id INT=SCOPE_IDENTITY();
INSERT INTO Rider(rider_id,vehicle_type,plate_no,license_no,is_available,zone_id) VALUES(@user_id,@vehicle_type,@plate_no,@license_no,1,@zone_id);
INSERT INTO User_Phone(user_id,phone) VALUES(@user_id,@phone);
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE FUNCTION dbo.CustomerLoginValidation(@username VARCHAR(30),@password VARCHAR(30)) RETURNS BIT
AS
BEGIN
DECLARE @success BIT=0;
IF EXISTS(SELECT 1 FROM Users U INNER JOIN Customer C ON U.user_id=C.customer_id WHERE U.username=@username AND U.password=@password AND U.account_status ='Active')
BEGIN
SET @success=1;
END;
RETURN @success;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE FUNCTION dbo.PartnerLoginValidation(@username VARCHAR(30),@password VARCHAR(30)) RETURNS BIT
AS
BEGIN
DECLARE @success BIT=0;
IF EXISTS(SELECT 1 FROM Users U INNER JOIN Partner P ON U.user_id=P.partner_id AND U.username=@username AND U.password=@password AND U.account_status ='Active')
BEGIN
SET @success =1;
END;
RETURN @success;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE FUNCTION dbo.RiderLoginValidation(@username VARCHAR(30),@password VARCHAR(30)) RETURNS BIT
AS
BEGIN
DECLARE @success BIT=0;
IF EXISTS(SELECT 1 FROM Users U INNER JOIN Rider R ON U.user_id=R.rider_id AND U.username=@username AND U.password=@password AND U.account_status ='Active')
BEGIN
SET @success=1;
END;
RETURN @success;
END; 
GO


-- MARTIN JOSEPH 64-27346
CREATE FUNCTION dbo.AdminLoginValidation(@username VARCHAR(30),@password VARCHAR(30)) RETURNS BIT
AS
BEGIN
DECLARE @success BIT=0;
IF EXISTS(SELECT 1 FROM Users U INNER JOIN Admin A ON U.user_id=A.admin_id AND U.username=@username AND U.password=@password AND U.account_status ='Active')
BEGIN
SET @success=1;
END;
RETURN @success;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Change_Password 
@user_id INT,@old_password VARCHAR(30),@new_password VARCHAR(30),@new_password_repeat VARCHAR(30),@success BIT OUTPUT
AS
BEGIN
SET @success=0;
IF(@new_password IS NULL OR @old_password IS NULL OR @new_password_repeat IS NULL)
BEGIN
RETURN -1;
END;

IF(@new_password <> @new_password_repeat)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@user_id)
BEGIN
RETURN -1;
END;

IF @old_password NOT IN(SELECT password FROM Users U WHERE U.user_id=@user_id)
BEGIN
RETURN -1;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@user_id AND U.password=@old_password)
BEGIN
UPDATE Users
SET password=@new_password WHERE user_id=@user_id;
SET @success=1;
END;
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Create_Admin 
@first_name VARCHAR(30),@middle_name VARCHAR(30),@last_name VARCHAR(30),@username VARCHAR(30),@password VARCHAR(30),@email VARCHAR(100),@phone CHAR(11),@dob DATE,@role VARCHAR(20),@zone_id INT,@super_admin_id INT
AS
BEGIN
IF(@role IS NOT NULL AND @role <>'Super Admin' AND @role <>'Zone Admin')
BEGIN
RETURN -1;
END;

IF(@first_name IS NULL  OR @last_name IS NULL OR @username IS NULL OR @password IS NULL OR @email IS NULL OR @phone IS NULL OR LEN(@phone)<>11 OR @phone LIKE '%[^0-9]%' OR @dob>=CAST(GETDATE() AS DATE ) OR @email NOT LIKE '%_@_%._%' OR @email LIKE '% %')
BEGIN
RETURN -1;
END;
IF NOT EXISTS (SELECT 1 FROM Users U WHERE U.user_id=@super_admin_id)
BEGIN
RETURN -1;
END;
IF((@role IS NULL OR @role='Super Admin') AND @zone_id IS NOT NULL)
BEGIN
RETURN -1;
END;
IF(@role='Zone Admin' AND (@zone_id IS NULL OR NOT EXISTS(SELECT 1 FROM Zone Z WHERE Z.zone_id=@zone_id)))
BEGIN
RETURN -1;
END;
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@super_admin_id AND (A.role='Super Admin'  OR A.role IS NULL))
BEGIN
RETURN -3;
END;
IF EXISTS(SELECT 1 FROM Users U WHERE U.email=@email OR U.username=@username)
BEGIN
RETURN -2;
END;
IF(@role IS NULL)
BEGIN
SET @role='Super Admin';
END;
INSERT INTO Users(first_name,middle_name,last_name,username,password,email,dob) VALUES (@first_name,@middle_name,@last_name,@username,@password,@email,@dob);
DECLARE @user_id INT=SCOPE_IDENTITY();
INSERT INTO Admin(admin_id,role,zone_id) VALUES(@user_id,@role,@zone_id);
INSERT INTO User_Phone(user_id,phone) VALUES(@user_id,@phone);
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Approve_Business
@business_id INT,@admin_id INT
AS
BEGIN
IF NOT EXISTS (SELECT 1 FROM Business B WHERE B.business_id=@business_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id =@admin_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Admin A,Business B WHERE A.admin_id=@admin_id AND A.role='Zone Admin' AND B.business_id=@business_id AND A.zone_id <> B.zone_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Business B WHERE B.business_id=@business_id AND B.status<>'Pending')
BEGIN
RETURN -4;
END;

UPDATE Business
SET status='Active' WHERE business_id=@business_id;
RETURN 0;


END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Reject_Business
@business_id INT,@admin_id INT
AS
BEGIN
IF NOT EXISTS (SELECT 1 FROM Business B WHERE B.business_id=@business_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id =@admin_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Admin A,Business B WHERE A.admin_id=@admin_id AND A.role='Zone Admin' AND B.business_id=@business_id AND A.zone_id <> B.zone_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Business B WHERE B.business_id=@business_id AND B.status<>'Pending')
BEGIN
RETURN -4;
END;

UPDATE Business
SET status='Rejected' WHERE business_id=@business_id;
RETURN 0;


END;
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Suspend_Business
    @business_id INT, @admin_id INT, @reason VARCHAR(255)
AS
    IF @admin_id IS NULL OR @business_id IS NULL OR @reason IS NULL
        RETURN -1;

    IF NOT EXISTS (SELECT *
                    FROM Admin
                    WHERE admin_id = @admin_id)
        RETURN -3;

    IF NOT EXISTS (SELECT *
                    FROM Business
                    WHERE business_id = @business_id)
        RETURN -1;

    DECLARE @admin_role VARCHAR(20);

    SELECT @admin_role = role
    FROM Admin
    WHERE admin_id = @admin_id;

    DECLARE @business_zone_id INT;
    DECLARE @admin_zone_id INT;

    SELECT @business_zone_id = zone_id
    FROM Business
    WHERE business_id = @business_id;

    SELECT @admin_zone_id = zone_id
    FROM Admin
    WHERE admin_id = @admin_id;
        
    IF @admin_role = 'Zone Admin' AND @admin_zone_id <> @business_zone_id
        RETURN -3;

    DECLARE @business_status VARCHAR(20);

    SELECT @business_status = status
    FROM Business
    WHERE business_id = @business_id;
    
    IF @business_status <> 'Active'
    BEGIN
        RETURN -4;
    END

    UPDATE Business
    SET status = 'Suspended', suspension_reason = @reason
    WHERE business_id = @business_id;

    UPDATE Product
    SET is_available = 0
    WHERE business_id = @business_id;

    SELECT O.order_id, O.voucher_id
    INTO #EditedOrders
    FROM Orders O JOIN SubOrder S ON O.order_id = S.order_id
    AND S.business_id = @business_id
    AND S.status IN ('Placed', 'Assigned');

    SELECT S.order_id, S.suborder_id, S.total_price, S.delivery_fee
    INTO #EditedSubOrders
    FROM SubOrder S
    WHERE S.business_id = @business_id
    AND S.status IN ('Placed', 'Assigned');

    UPDATE Suborder
    SET status = 'Cancelled'
    WHERE business_id = @business_id
    AND status IN ('Placed', 'Assigned');

    SELECT 
        P.payment_id,
        P.order_id,
        P.method,
        CASE 
            WHEN P.refunded_amount + ESO.raw_refund > P.amount 
                THEN P.amount - P.refunded_amount
            ELSE ESO.raw_refund
        END AS actual_refund
    INTO #OrderRefunds
    FROM Payment P
    INNER JOIN (
        SELECT order_id, SUM(total_price + delivery_fee) AS raw_refund
        FROM #EditedSubOrders
        GROUP BY order_id
    ) ESO ON P.order_id = ESO.order_id;

    UPDATE P
    SET P.refunded_amount = P.refunded_amount + R.actual_refund
    FROM Payment P
    INNER JOIN #OrderRefunds R ON P.payment_id = R.payment_id;

    UPDATE C
    SET C.wallet_balance = C.wallet_balance + WalletCredits.total_credit
    FROM Customer C
    INNER JOIN (
        SELECT 
            Ct.customer_id,
            SUM(R.actual_refund) AS total_credit
        FROM #OrderRefunds R
        INNER JOIN Orders O ON R.order_id = O.order_id
        INNER JOIN Cart Ct ON O.cart_id = Ct.cart_id
        WHERE R.method <> 'Cash'
        GROUP BY Ct.customer_id
    ) WalletCredits ON C.customer_id = WalletCredits.customer_id;

    DROP TABLE #OrderRefunds;
    DROP TABLE #EditedSubOrders;

    SELECT 
        O.order_id, 
        ROW_NUMBER() OVER (ORDER BY O.order_id) AS RowNum
    INTO #TempOrders
    FROM Orders O
    INNER JOIN SubOrder S ON O.order_id = S.order_id
    WHERE S.business_id = @business_id;

    DECLARE @i INT = 1;
    DECLARE @max INT = (SELECT COUNT(*) FROM #TempOrders);
    DECLARE @curr_order_id INT;

    WHILE @i <= @max
    BEGIN
        SELECT @curr_order_id = order_id 
        FROM #TempOrders 
        WHERE RowNum = @i;

        EXEC Helper_Recompute_Order_Status @order_id = @curr_order_id;

        SET @i = @i + 1;
    END;

    DROP TABLE #TempOrders;

    UPDATE Voucher
    SET status = 'Unused'
    WHERE voucher_id IN (
        SELECT EO.voucher_id
        FROM #EditedOrders EO JOIN Orders O ON EO.order_id = O.order_id
        WHERE O.status = 'Cancelled'
    );

    UPDATE Orders
    SET voucher_id = NULL
    WHERE order_id IN (
        SELECT EO.order_id
        FROM #EditedOrders EO JOIN Orders O ON EO.order_id = O.order_id
        WHERE O.status = 'Cancelled'
    );

    DROP TABLE #EditedOrders;
    RETURN 0;
GO


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


-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Create_Zone
    @zone_name VARCHAR(50), @delivery_fee DECIMAL(10,2), @super_admin_id INT
AS
    IF @super_admin_id IS NULL
        RETURN -1;
    IF NOT EXISTS (SELECT admin_id
                   FROM Admin
                   WHERE role = 'Super Admin'
                   AND admin_id = @super_admin_id)
        RETURN -3;
    IF @zone_name IS NULL OR LTRIM(RTRIM(@zone_name)) = '' OR @delivery_fee IS NULL OR @delivery_fee < 0 
        RETURN -1;
    IF @zone_name IN (SELECT zone_name
                      FROM Zone)
        RETURN -2;


    INSERT INTO Zone (zone_name, delivery_fee)
    VALUES (@zone_name, @delivery_fee);
    RETURN 0;
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER PROCEDURE Update_Zone_Fee
    @zone_id INT, @new_fee DECIMAL(10,2), @super_admin_id INT
AS

    IF @super_admin_id IS NULL
        RETURN -1;

    IF NOT EXISTS (SELECT admin_id
                   FROM Admin
                   WHERE role = 'Super Admin'
                   AND admin_id = @super_admin_id)
        RETURN -3;

    IF NOT EXISTS (SELECT zone_id
                   FROM Zone
                   WHERE zone_id = @zone_id)
        RETURN -1;

    IF @new_fee IS NULL OR @new_fee < 0 
        RETURN -1;

    UPDATE Zone
    SET delivery_fee = @new_fee
    WHERE zone_id = @zone_id;

    RETURN 0;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Assign_Admin_Zone
@admin_id INT,@zone_id INT,@super_admin_id INT
AS
BEGIN
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@super_admin_id AND(A.role='Super Admin' OR A.role IS NULL))
BEGIN
RETURN -3;
END;
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id AND A.role='Zone Admin')
BEGIN
RETURN -1;
END;
IF NOT EXISTS(SELECT 1 FROM Zone Z WHERE Z.zone_id=@zone_id)
BEGIN
RETURN -1;
END;
UPDATE Admin
SET zone_id=@zone_id WHERE admin_id=@admin_id;
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Issue_Voucher
@customer_id INT,@promo_code VARCHAR(30),@is_percentage BIT,@amount DECIMAL(10,2),@expiry_date DATE,@admin_id INT
AS
BEGIN
IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@admin_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id)
BEGIN
RETURN -1;
END;

IF(@promo_code IS NULL OR @is_percentage IS NULL OR @amount IS NULL OR @expiry_date IS NULL OR @amount<=0)OR(@is_percentage =1 AND (@amount<1 OR @amount>100))OR(@expiry_date<CAST(GETDATE() AS DATE))
BEGIN
RETURN -1;
END;

IF EXISTS(SELECT 1 FROM Users U INNER JOIN Customer C ON U.user_id=C.customer_id AND C.customer_id=@customer_id AND U.account_status='Blacklisted')
BEGIN
RETURN -3;
END;
IF NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;


IF NOT EXISTS(SELECT 1 FROM Customer C WHERE C.customer_id=@customer_id)
BEGIN
RETURN -3;
END;

IF EXISTS(SELECT 1 FROM Voucher V WHERE V.promo_code=@promo_code)
BEGIN
RETURN -2;
END;


INSERT INTO Voucher (promo_code, is_percentage, amount, expiry_date, customer_id)
VALUES (@promo_code, @is_percentage, @amount, @expiry_date, @customer_id);
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Blacklist_Customer
@customer_id INT,@admin_id INT,@reason VARCHAR(255)
AS
BEGIN
IF ((@customer_id IS NULL OR @admin_id IS NULL OR @reason IS NULL) OR NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id) OR NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@admin_id))
BEGIN
RETURN -1;
END;
IF EXISTS (SELECT 1 FROM Blacklist B WHERE B.customer_id=@customer_id) OR EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id AND U.account_status='Blacklisted')
BEGIN
RETURN -3;
END;
IF (NOT EXISTS(SELECT 1 FROM Customer C WHERE C.customer_id=@customer_id) OR NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id))
BEGIN
RETURN -3;
END;
IF EXISTS(SELECT 1 FROM Admin A WHERE A.role='Zone Admin' AND A.admin_id=@admin_id)AND NOT EXISTS(SELECT 1 FROM Admin A INNER JOIN Zone Z ON A.zone_id=Z.zone_id INNER JOIN Address AD ON Z.zone_id=AD.zone_id WHERE AD.customer_id=@customer_id AND A.role='Zone Admin' AND A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;
UPDATE Users
SET account_status='Blacklisted' WHERE user_id=@customer_id;
INSERT INTO Blacklist(customer_id,admin_id,reason) VALUES(@customer_id,@admin_id,@reason);
DECLARE @orders_to_cancel TABLE (
row_id int IDENTITY(1,1),order_id int
);
INSERT INTO @orders_to_cancel (order_id)
SELECT o.order_id
FROM Orders o
JOIN Cart c ON o.cart_id = c.cart_id
WHERE c.customer_id = @customer_id
AND o.status <> 'Cancelled'
AND NOT EXISTS (
SELECT 1 FROM SubOrder so
WHERE so.order_id = o.order_id 
AND so.status IN ('Picked Up', 'Delivered')
);
DECLARE @current_order_id int;
WHILE EXISTS (SELECT 1 FROM @orders_to_cancel)
BEGIN   
SELECT TOP 1 @current_order_id = order_id  FROM @orders_to_cancel;      
EXEC Cancel_Order @order_id = @current_order_id;
DELETE FROM @orders_to_cancel 
WHERE order_id = @current_order_id;
END;
DELETE FROM Voucher WHERE customer_id=@customer_id AND status='Unused';
RETURN 0;
END;
GO


-- MARTIN JOSEPH 64-27346
CREATE PROCEDURE Lift_Customer_Blacklist
@customer_id INT,@admin_id INT
AS
BEGIN
IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@customer_id)
BEGIN
RETURN -1;
END;

IF NOT EXISTS(SELECT 1 FROM Users U WHERE U.user_id=@admin_id)
BEGIN
RETURN -1;
END;


IF NOT EXISTS(SELECT 1 FROM Customer C WHERE C.customer_id=@customer_id)
BEGIN
RETURN -3;
END;

IF NOT EXISTS(SELECT 1 FROM Blacklist B WHERE B.customer_id=@customer_id)
BEGIN
RETURN -4;
END;
IF NOT EXISTS(SELECT 1 FROM Blacklist B WHERE B.customer_id=@customer_id AND B.admin_id=@admin_id) OR NOT EXISTS(SELECT 1 FROM Admin A WHERE A.admin_id=@admin_id)
BEGIN
RETURN -3;
END;

DELETE FROM Blacklist WHERE customer_id=@customer_id;
UPDATE Users
SET account_status='Active' WHERE user_id=@customer_id;
RETURN 0;
END;
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER FUNCTION dbo.ZoneOrderReport (@zone_id INT, @from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN
(

    SELECT Z.zone_id AS zone_id, Z.zone_name AS zone_name, COUNT(O.order_id) AS number_of_orders, CAST(AVG(O.total_amount) AS DECIMAL(10,2)) AS avg_order_total,
    ISNULL((SELECT CAST((1/10.0)*SUM(S.total_price) AS DECIMAL(10,2))
    FROM Orders O2 JOIN SubOrder S ON O2.order_id = S.order_id
    WHERE O2.zone_id = @zone_id AND CAST(O2.order_date AS DATE) BETWEEN @from_date AND @to_date
             AND S.status <> 'Cancelled'
            ),0) AS platform_commission
    FROM Zone Z LEFT JOIN Orders O ON Z.zone_id = O.zone_id AND O.status <> 'Cancelled' AND CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date
    WHERE Z.zone_id = @zone_id 
    AND @to_date >= @from_date
    GROUP BY Z.zone_id, Z.zone_name
    
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION TopRiders(@from_date DATE,@to_date DATE)
RETURNS TABLE
AS
RETURN(
	SELECT *
	FROM(
	SELECT ROW_NUMBER() OVER (ORDER BY COUNT(d.delivery_id) DESC, rider_id ASC) AS rider_rank,
	r.rider_id, CONCAT(u.first_name,' ',u.last_name) AS rider_name,
	COUNT(d.delivery_id) AS completed_delivery_count
	FROM Rider r INNER JOIN Users u ON r.rider_id = u.user_id
	INNER JOIN (SELECT * FROM Delivery WHERE CAST(delivered_at AS DATE) >= @from_date AND CAST(delivered_at AS DATE) <= @to_date)
	AS d ON d.rider_id = r.rider_id
	GROUP BY r.rider_id,u.first_name,u.last_name
	)AS T
	WHERE T.rider_rank BETWEEN 1 AND 5
);
GO


-- Youssef Sameh 64-10650
CREATE OR ALTER FUNCTION dbo.Daily_Revenue_Report (@report_date DATE)
RETURNS TABLE
AS
RETURN
(
    SELECT Z.zone_name AS zone_name,
    CASE WHEN P.pharmacy_type IS NOT NULL THEN 'Pharmacy'
         ELSE 'Restaurant'
         END 
         AS business_type,
        COUNT(S.suborder_id) AS number_of_suborders, SUM(S.total_price) AS gross_sales, SUM(S.delivery_fee) AS delivery_fees, CAST((1/10.0)*SUM(S.total_price) AS DECIMAL(10,2)) AS platform_commission
    FROM SubOrder S LEFT JOIN Pharmacy P ON P.business_id = S.business_id
    JOIN Business B ON S.business_id = B.business_id
    JOIN Zone Z ON B.zone_id = Z.zone_id
    WHERE S.order_id IN
    (
        SELECT order_id
        FROM Orders O
        WHERE CAST (O.order_date AS DATE) = @report_date
    )
    AND S.status <> 'Cancelled'
    GROUP BY Z.zone_name, CASE WHEN P.pharmacy_type IS NOT NULL THEN 'Pharmacy'
         ELSE 'Restaurant'
         END
);
GO


--Ziad Yasser Ibrahim 65-33790

GO
Create Procedure Register_Business
@partner_id INT, @name VARCHAR(100), @description VARCHAR(255),
@link_website VARCHAR(255), @zone_id INT, @opening_hour TIME, @closing_hour TIME, @expected_delivery_time INT,
@phone CHAR(11), @business_type VARCHAR(20), @cuisine_type VARCHAR(50), @food_category VARCHAR(50), @pharmacy_type VARCHAR(50)
AS
BEGIN

IF @partner_id IS NULL OR NOT EXISTS(SELECT * FROM Partner P WHERE P.partner_id = @partner_id)
RETURN -1;

IF EXISTS(SELECT * FROM Users U WHERE U.user_id = @partner_id AND U.account_status = 'Blacklisted')
RETURN -3;

IF @name IS NULL OR LTRIM(RTRIM(@name)) = '' OR
@zone_id IS NULL OR @zone_id NOT IN (SELECT zone_id FROM Zone)
OR @opening_hour IS NULL OR @closing_hour IS NULL OR @expected_delivery_time IS NULL 
OR @expected_delivery_time <= 0 OR
@phone IS NULL OR LEN(@phone) <> 11 OR @phone LIKE '%[^0123456789]%' 
RETURN -1;

IF @business_type = 'Pharmacy'
BEGIN
IF @pharmacy_type IS NULL OR LTRIM(RTRIM(@pharmacy_type)) = ''
OR @cuisine_type IS NOT NULL OR @food_category IS NOT NULL
RETURN -1;
END

ELSE IF @business_type = 'Restaurant'
BEGIN
IF @cuisine_type IS NULL OR LTRIM(RTRIM(@cuisine_type)) = ''
OR @food_category IS NULL OR LTRIM(RTRIM(@food_category)) = ''
OR @pharmacy_type IS NOT NULL 
RETURN -1;
END

ELSE
RETURN -1;

declare @business_id INT
declare @business_status VARCHAR(20)

SELECT @business_id = B.business_id , @business_status = B.status
FROM Business B 
WHERE B.partner_id = @partner_id;

IF @business_id IS NOT NULL AND @business_status <> 'Rejected'
RETURN -2;

IF @business_id IS NULL 
BEGIN
INSERT INTO Business (name, description, link_website, opening_hour, closing_hour, 
expected_delivery_time, status , suspension_reason, partner_id , zone_id)
VALUES (@name, @description, @link_website, @opening_hour, @closing_hour , 
@expected_delivery_time, 'Pending', NULL, @partner_id, @zone_id);
SET @business_id = SCOPE_IDENTITY();
END
ELSE 
BEGIN
UPDATE Business 
SET Business.name = @name,
Business.description = @description,
Business.link_website = @link_website,
Business.opening_hour = @opening_hour,
Business.closing_hour = @closing_hour,
Business.expected_delivery_time = @expected_delivery_time,
Business.status = 'Pending',
Business.suspension_reason = NULL,
Business.partner_id = @partner_id,
Business.zone_id = @zone_id
WHERE Business.business_id = @business_id;

DELETE FROM Business_Phone
WHERE Business_Phone.business_id = @business_id;

DELETE FROM Restaurant 
WHERE Restaurant.business_id = @business_id;

DELETE FROM Pharmacy 
WHERE Pharmacy.business_id = @business_id;
END

INSERT Business_Phone (business_id,phone)
VALUES (@business_id, @phone);

IF @business_type = 'Restaurant'
BEGIN
INSERT INTO Restaurant (business_id, cuisine_type, food_category)
VALUES (@business_id, @cuisine_type, @food_category);
END 

ELSE 
BEGIN
INSERT INTO Pharmacy(business_id, pharmacy_type)
VALUES (@business_id, @pharmacy_type);
END
RETURN 0;
END 
GO


--Ziad Yasser Ibrahim 65-33790

GO
CREATE PROCEDURE Update_Business_Info
@business_id INT, @opening_hour TIME, @closing_hour TIME, @phone CHAR(11), @link_website VARCHAR(255)
AS
BEGIN

IF @business_id IS NULL OR @business_id NOT IN (SELECT business_id FROM Business) OR @opening_hour IS NULL
OR @closing_hour IS NULL OR @phone IS NULL OR LEN(@phone) <> 11 OR @phone LIKE '%[^0123456789]%' 
RETURN -1;

IF EXISTS(SELECT * FROM Business B INNER JOIN Users U ON B.partner_id = U.user_id WHERE B.business_id = @business_id
      AND U.account_status = 'Blacklisted')
RETURN -3;

IF EXISTS(SELECT * FROM Business_Phone B WHERE B.business_id = @business_id AND B.phone = @phone)
RETURN -2;

UPDATE Business 
SET Business.link_website = @link_website,
Business.opening_hour = @opening_hour,
Business.closing_hour = @closing_hour
WHERE Business.business_id = @business_id;

INSERT INTO Business_Phone (business_id,phone)
VALUES (@business_id, @phone);
RETURN 0;

END
GO


--Ziad Yasser Ibrahim 65-33790

GO 
CREATE PROCEDURE Upsert_Product
@business_id INT, @product_id INT, @name VARCHAR(100), @description VARCHAR(255), @category VARCHAR(50), @price DECIMAL(10,2),
@is_available BIT
AS

IF @business_id IS NULL OR NOT EXISTS (SELECT * FROM Business WHERE business_id = @business_id)
OR @name IS NULL OR LTRIM(RTRIM(@name)) = '' OR @category IS NULL OR LTRIM(RTRIM(@category)) = ''
OR @price IS NULL OR @price <= 0 OR @is_available IS NULL
RETURN -1;

IF EXISTS (SELECT * FROM Business B INNER JOIN Users U ON B.partner_id = U.user_id
        WHERE B.business_id = @business_id AND U.account_status = 'Blacklisted')
RETURN -3;

IF EXISTS (SELECT * FROM Business WHERE business_id = @business_id
AND status = 'Suspended')
RETURN -4;

BEGIN 
IF @product_id IS NULL 
BEGIN 
INSERT INTO Product (name, description, category, price, is_available, business_id)
VALUES (@name, @description, @category, @price, @is_available, @business_id);
RETURN 0;
END

IF NOT EXISTS (SELECT * FROM Product WHERE product_id = @product_id)
RETURN -1;

IF NOT EXISTS (SELECT * FROM Product WHERE product_id = @product_id
AND business_id = @business_id)
RETURN -3;

UPDATE Product 
SET Product.name = @name,
Product.description = @description, 
Product.category = @category,
Product.price = @price,
Product.is_available = @is_available
WHERE Product.product_id = @product_id
RETURN 0;
END
GO


--Ziad Yasser Ibrahim 65-33790

GO 
CREATE PROCEDURE Toggle_Product_Status
@product_id INT, @is_available BIT
AS

IF @product_id IS NULL OR @is_available IS NULL OR NOT EXISTS (SELECT * FROM Product Where product_id = @product_id)
RETURN -1;

IF EXISTS (SELECT * FROM Product P INNER JOIN Business B ON P.business_id = B.business_id
INNER JOIN Users U ON B.partner_id = U.user_id WHERE P.product_id = @product_id
AND U.account_status = 'Blacklisted')
RETURN -3;

IF @is_available = 1 AND EXISTS (SELECT * FROM Product P INNER JOIN Business B
ON P.business_id = B.business_id WHERE P.product_id = @product_id AND B.status = 'Suspended')
RETURN -4;

UPDATE Product 
SET Product.is_available = @is_available
WHERE Product.product_id = @product_id;

RETURN 0;
GO


--Ziad Yasser Ibrahim 65-33790

GO 
CREATE PROCEDURE Set_Product_Promotion
@product_id INT, @discount_amount DECIMAL(10,2)
AS
BEGIN 

DECLARE @price DECIMAL(10,2)
SELECT @price = price
FROM Product
WHERE product_id = @product_id;

IF @product_id IS NULL OR @price IS NULL OR @discount_amount IS NULL OR
@discount_amount < 0 OR @discount_amount > 0.5*@price
RETURN -1;

IF EXISTS (SELECT * FROM Product P INNER JOIN Business B ON P.business_id = B.business_id
INNER JOIN Users U ON B.partner_id = U.user_id WHERE P.product_id = @product_id
AND U.account_status = 'Blacklisted')
RETURN -3;

IF EXISTS (SELECT * FROM Product P INNER JOIN Business B
ON P.business_id = B.business_id WHERE P.product_id = @product_id AND B.status = 'Suspended')
RETURN -4;

UPDATE Product
SET Product.discount_amount = @discount_amount
WHERE Product.product_id = @product_id;
RETURN 0;

END;
GO


--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.BusinessSalesReport (@business_id INT, @from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN(
SELECT P.product_id, P.name AS product_name, SUM(CI.quantity) AS units_sold, SUM(CI.quantity * CI.unit_price) AS revenue_per_product
FROM Orders O 
INNER JOIN SubOrder S ON O.order_id = S.order_id
INNER JOIN CartItem CI ON O.cart_id = CI.cart_id
INNER JOIN Product P ON CI.product_id = P.product_id
WHERE S.business_id = @business_id AND P.business_id = @business_id AND S.status <> 'Cancelled' AND @from_date IS NOT NULL AND @to_date IS NOT NULL AND
@from_date <= @to_date AND (CAST(O.order_date AS DATE) BETWEEN @from_date AND @to_date)

GROUP BY P.product_id, P.name
);
GO


--Omar Waleed El-sayed 64-29234

CREATE FUNCTION dbo.BusinessFeedbackOverview (@business_id INT)
RETURNS TABLE
AS
RETURN(
SELECT AVG(CAST(F.rating AS DECIMAL(10,2))) AS avg_rating, COUNT(F.feedback_id) AS number_of_feedbacks,
SUM(CASE WHEN F.rating = 5 THEN 1 ELSE 0 END) AS five_star, SUM(CASE WHEN F.rating = 4 THEN 1 ELSE 0 END) AS four_star, 
SUM(CASE WHEN F.rating = 3 THEN 1 ELSE 0 END) AS three_star, SUM(CASE WHEN F.rating = 2 THEN 1 ELSE 0 END) AS two_star,
SUM(CASE WHEN F.rating = 1 THEN 1 ELSE 0 END) AS one_star
FROM  Business B
LEFT OUTER JOIN SubOrder S ON S.business_id = B.business_id
LEFT OUTER JOIN Feedback F ON S.suborder_id = F.suborder_id
WHERE B.business_id = @business_id
GROUP BY B.business_id
);
GO


go
--Ahmed Walid 64-25319 s3
create procedure  Add_Customer_Address 
@customer_id int, @description varchar(150), @zone_id int 
as 
begin
if @customer_id is null or @description is null or @zone_id is null  or @description=''
return -1;

--if exists (select * from address where @customer_id=customer_id and @description= description and @zone_id=zone_id)
--return -2;


update address set is_active= 0
where @customer_id=customer_id
insert into address (customer_id, description, zone_id)
values(@customer_id, @description, @zone_id)

return 0;
end
go


go 
--Ahmed Walid 64-25319 s3
create procedure Update_Delete_Customer_Address
@customer_id int, @address_id int, @description varchar(150), @zone_id int, @action varchar(20) 
as
begin

declare @validupd bit
select @validupd = case when exists(select * from cart c
inner join orders o on o.cart_id=c.cart_id
where @customer_id=c.customer_id and @address_id=c.address_id and o.status in ('Placed', 'In Progress') ) then 0 else 1 end

declare @validdel bit
select @validdel = case when not exists(select * from cart c 
where @customer_id=c.customer_id and @address_id=c.address_id ) or exists (select * from cart c
inner join orders o on o.cart_id=c.cart_id
where @customer_id=c.customer_id and @address_id=c.address_id and o.status in ('Placed', 'In Progress'))
then 1 else 0 end

if (@customer_id is null or @address_id is null or @action is null) or
(@action='update' and (@description is null or @description='' or @zone_id is null))or
(@action!='update' and @action!='delete')
return -1;

if not exists (select * from address where address_id=@address_id and @customer_id=customer_id)
return -3;

if exists(select * from cart c inner join cartitem ci on ci.cart_id=c.cart_id
inner join product p on p.product_id=ci.product_id
inner join business b on b.business_id=p.business_id
where c.address_id=@address_id and b.zone_id!=@zone_id and c.status='Active')
return -5;

if @validupd=0 or (@action='delete' and @validdel=0)
return -4;

if @action='delete' and @validdel=1
begin
declare @wasactive bit
select @wasactive=(select is_active from address where @address_id=address_id and @customer_id=customer_id and is_active=1)
delete from address where @address_id=address_id and @customer_id=customer_id

if @wasactive=1
update address set is_active=1 where address_id=(select min(address_id) from address where customer_id=@customer_id)
end

if @validupd=1 and @action='update'
update address set description=@description, zone_id=@zone_id where @address_id=address_id and @customer_id=customer_id

return 0;
end
go


go
--Ahmed Walid 64-25319 s3
create procedure Change_Active_Address 
@customer_id int, @new_address_id int
as
begin
if @customer_id is null or @new_address_id is null
return -1;

if not exists (select * from address where @customer_id=customer_id and @new_address_id=address_id) 
return -3;

update address set is_active= case when @new_address_id =address_id then 1 else 0 end
where @customer_id=customer_id
return 0;

end 
go


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


go
--Ahmed Walid 64-25319 s3
create procedure Create_Cart
@customer_id int
as 
begin
declare @add int
select @add=(select a.address_id from address a where a.customer_id = @customer_id and a.is_active=1 )
if @customer_id is null
return -1;

if exists(select* from users where @customer_id=user_id and account_status='Blacklisted')
return -3;

if @add is null
return -1;

if exists(select * from cart c 
where customer_id = @customer_id and address_id = @add and status = 'Active')
return -2;



insert into cart (customer_id,address_id) values(@customer_id,@add)
return 0;
end 
go


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
begin
print('not your active address')
return -4;
end

if not exists(select * from product p inner join business b on b.business_id=p.business_id
where @product_id=p.product_id and b.status='Active' or p.is_available=0 )
return -4;

declare @cartzone int
declare @businesszone int

select @cartzone =(select a.zone_id from cart c inner join address a on a.address_id=c.address_id where c.cart_id=@cart_id)
select @businesszone= (select b.zone_id from product p inner join business b on b.business_id=p.business_id where p.product_id=@product_id)

if @cartzone!=@businesszone
begin
print ('not your zone')
return -5;
end
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

declare @now time
set @now= cast(getdate() as time)
if exists (select * from cartitem ci inner join product p on p.product_id=ci.product_id
inner join business b on p.business_id=b.business_id
where ci.cart_id=@cart_id and ((b.opening_hour < b.closing_hour and( @now < b.opening_hour or @now >= b.closing_hour))or (b.opening_hour > b.closing_hour and (@now >= b.closing_hour and @now < b.opening_hour))))
return -4;


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

if @card_id is null or not exists(select *from card where card_id=@card_id and customer_id =@customer_id and expiration_date> cast(GETDATE() as date))
select @isValidCard=0


if @isValidCard=0 and @payment_method='Card'
return -7;


declare @suborder_id int, @rider_id int

set @rider_id = null
    select top 1 @rider_id = r.rider_id
    from Rider r
inner join Users u on u.user_id = r.rider_id
left join Delivery d on d.rider_id = r.rider_id
left join SubOrder s on s.suborder_id = d.suborder_id and s.status in ('Assigned', 'Picked Up')
where r.zone_id = @zone_id and r.is_available = 1 and u.account_status = 'Active'
group by r.rider_id
order by count(s.suborder_id), r.rider_id

    if @rider_id is null
    begin
        return -8
    end


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


while exists (select 1 from suborder where order_id = @order_id and status = 'Placed')
begin
set @rider_id=null
    select top 1 @rider_id = r.rider_id
    from Rider r
inner join Users u on u.user_id = r.rider_id
left join Delivery d on d.rider_id = r.rider_id
left join SubOrder s on s.suborder_id = d.suborder_id and s.status in ('Assigned', 'Picked Up')
where r.zone_id = @zone_id and r.is_available = 1 and u.account_status = 'Active'
group by r.rider_id
order by count(s.suborder_id), r.rider_id

    if @rider_id is null
    begin
        return -8
    end

    select @suborder_id = min(suborder_id) from suborder where order_id = @order_id and status = 'Placed'

    insert into Delivery (assigned_at, suborder_id, rider_id) values (getdate(), @suborder_id, @rider_id)
    update suborder set status='Assigned' where suborder_id = @suborder_id
end

if @payment_method='Card'
Insert into Payment(amount, method, transaction_date, order_id ,card_id) 
values(@total, @payment_method, getdate(), @order_id, @card_id)
else 
Insert into Payment(amount, method, transaction_date, order_id ,card_id) 
values(@total, @payment_method, getdate(), @order_id, null)

if @payment_method='Wallet'
update customer set Customer.wallet_balance = wallet_balance - @total where customer_id = @customer_id

Update cart set status = 'Checked Out' where cart_id = @cart_id


return 0

end
go


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


﻿-- Omar Waleed El-sayed 64-29234


GO
CREATE PROCEDURE Submit_Feedback
	@suborder_id INT,
	@headline VARCHAR(100),
	@description VARCHAR(500),
	@rating INT
AS
BEGIN
	IF @suborder_id NOT IN (SELECT suborder_id FROM SubOrder)
	BEGIN
		RETURN -1;
	END

	IF @rating NOT BETWEEN 1 AND 5 OR @headline is NULL
	BEGIN
		RETURN -1;
	END
	
	IF @suborder_id IN (SELECT suborder_id FROM Feedback)
	BEGIN
		RETURN -2;
	END

	DECLARE @so_state VARCHAR(20)

	SELECT @so_state = status
	FROM SubOrder
	WHERE suborder_id = @suborder_id

	IF @so_state <> 'Delivered'
	BEGIN
		RETURN -4;
	END

	INSERT INTO Feedback(headline,description,rating,suborder_id)
	VALUES(@headline,@description,@rating,@suborder_id);

	RETURN 0;
END
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Rate_Rider
	@suborder_id int,
	@rider_rating int
AS
BEGIN
	IF @suborder_id NOT IN (SELECT suborder_id FROM SubOrder) OR @rider_rating NOT BETWEEN 1 AND 5
	BEGIN
		RETURN -1;
	END

	IF (SELECT d.rider_rating FROM Delivery d WHERE d.suborder_id=@suborder_id) is NOT NULL
	BEGIN
		RETURN -2;
	END

	DECLARE @so_state VARCHAR(20)

	SELECT @so_state = status
	FROM SubOrder
	WHERE suborder_id = @suborder_id

	IF @so_state <> 'Delivered'
	BEGIN
		RETURN -4;
	END

	UPDATE Delivery
	SET rider_rating=@rider_rating
	WHERE suborder_id = @suborder_id

	RETURN 0;
END
GO


go
--Ahmed Walid 64-25319 s3
create function dbo.My_Order_History(@customer_id int)
returns table
as
return(
select o.order_id as order_id,
o.order_date as order_date,
z.zone_name as zone_name,
o.status as status,
count(so.suborder_id) as number_of_suborders,
o.discount_amount as discount_amount,
o.total_amount as total_amount,
p.method as payment_method,
p.refunded_amount as refunded_amount
from orders o inner join zone z on z.zone_id=o.zone_id
inner join suborder so on o.order_id=so.order_id
left outer join payment p on p.order_id=o.order_id
inner join cart c on c.cart_id=o.cart_id
where c.customer_id=@customer_id
group by o.order_id,o.order_date,z.zone_name,o.status,o.discount_amount,o.total_amount,p.method,p.refunded_amount
)

go


--Ziad Yasser Ibrahim 65-33790

GO 
CREATE PROCEDURE Toggle_Favorite
@customer_id INT, @item_id INT, @item_type VARCHAR(20)
AS
BEGIN

IF @customer_id IS NULL OR NOT EXISTS(SELECT * FROM Customer WHERE customer_id = @customer_id) 
OR @item_id IS NULL OR @item_type IS NULL 
RETURN -1;

IF EXISTS(SELECT * FROM Users U WHERE U.user_id = @customer_id
      AND U.account_status = 'Blacklisted')
RETURN -3;

IF @item_type = 'Product'
BEGIN
IF NOT EXISTS(SELECT * FROM Product WHERE product_id = @item_id) 
RETURN -1;

IF EXISTS(SELECT * FROM Favorite_Product FP WHERE FP.customer_id = @customer_id AND FP.product_id = @item_id)
BEGIN
DELETE FROM Favorite_Product
WHERE product_id = @item_id AND customer_id = @customer_id;
END 

ELSE
BEGIN
INSERT INTO Favorite_Product(customer_id , product_id)
VALUES(@customer_id, @item_id)
END
END

ELSE IF @item_type = 'Business'
BEGIN
IF NOT EXISTS(SELECT * FROM Business WHERE business_id = @item_id) 
RETURN -1;

IF EXISTS(SELECT * FROM Favorite_Business FB WHERE FB.customer_id = @customer_id AND FB.business_id = @item_id)
BEGIN
DELETE FROM Favorite_Business
WHERE business_id = @item_id AND customer_id = @customer_id;
END

ELSE
BEGIN
INSERT INTO Favorite_Business(customer_id , business_id)
VALUES(@customer_id, @item_id)
END
END

ELSE
RETURN -1;

RETURN 0;

END
GO


--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.My_Favorites (@customer_id int)
RETURNS TABLE 
AS
RETURN(
SELECT P.product_id, P.name AS product_name, B.name AS business_name, CASE WHEN P.is_available = 1 AND
B.status = 'Active' THEN 1 ELSE 0 END AS is_orderable
FROM Favorite_Product FP
INNER JOIN Product P ON FP.product_id = P.product_id
INNER JOIN Business B ON P.business_id = B.business_id
WHERE FP.customer_id = @customer_id
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION Recommended_Products(@customer_id INT)
RETURNS TABLE
AS
RETURN(
SELECT TOP 10 T.product_id,T.product_name,T.business_name,T.category,T.final_price
FROM(
SELECT p.product_id,p.name AS product_name,b.name AS business_name,p.category,
		p.price-p.discount_amount AS final_price,
		(SELECT SUM(ci2.quantity)
		FROM Orders o2 INNER JOIN Cart c2 ON o2.cart_id = c2.cart_id 
					INNER JOIN CartItem ci2 ON ci2.cart_id = c2.cart_id
					INNER JOIN Product p2 ON ci2.product_id = p2.product_id
		WHERE c2.customer_id = @customer_id AND p.category = p2.category) AS count_of_ordered_category

FROM Product p INNER JOIN Business b ON p.business_id = b.business_id

WHERE p.is_available = 1 AND b.status = 'Active'  
	AND b.zone_id = (SELECT a.zone_id FROM Address a WHERE a.is_active=1 AND a.customer_id =@customer_id)
	AND NOT EXISTS( SELECT *
	FROM Orders o INNER JOIN Cart c ON o.cart_id = c.cart_id
		INNER JOIN CartItem ci ON ci.cart_id = c.cart_id
	WHERE c.customer_id = @customer_id AND ci.product_id = p.product_id
	)
) AS T

WHERE T.count_of_ordered_category>0

ORDER BY T.count_of_ordered_category DESC , T.product_id ASC
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Set_Rider_Availability
	@rider_id INT,
	@is_available BIT
AS
BEGIN
	IF @rider_id NOT IN (SELECT rider_id FROM Rider)
	BEGIN
	RETURN -1;
	END

	UPDATE Rider
	SET Rider.is_available = @is_available
	WHERE Rider.rider_id = @rider_id;

	RETURN 0;
END
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Active_Deliveries(@rider_id INT)
	RETURNS TABLE
AS
RETURN(
	
	SELECT d.delivery_id,
	o.order_id,
	so.suborder_id,
	b.name AS business_name,
	CONCAT(u.first_name,' ',u.last_name) AS customer_name,
	a.description AS address_description,
	z.zone_name,
	so.status,
	d.assigned_at

	FROM Delivery d 
	INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	INNER JOIN Orders o ON so.order_id = o.order_id 
	INNER JOIN Business b ON so.business_id=b.business_id
	INNER JOIN Zone z ON o.zone_id = z.zone_id
	INNER JOIN Cart c ON o.cart_id = c.cart_id
	INNER JOIN Address a ON c.address_id = a.address_id
	INNER JOIN Users u ON c.customer_id = u.user_id
	
	WHERE d.rider_id = @rider_id AND so.status IN ('Assigned','Picked Up')

)
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Mark_Picked_Up
	@delivery_id INT
AS
BEGIN
	
	IF @delivery_id NOT IN (SELECT delivery_id FROM Delivery)
	BEGIN
	RETURN -1;
	END
	
	DECLARE @c_state VARCHAR(20);

	SELECT @c_state = so.status
	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	WHERE d.delivery_id = @delivery_id

	IF @c_state <> 'Assigned'
	BEGIN
	RETURN -4;
	END

	UPDATE Delivery
	SET picked_up_at = GETDATE()
	WHERE delivery_id = @delivery_id;

	UPDATE SubOrder
	SET status = 'Picked Up'
	WHERE suborder_id IN (SELECT o.suborder_id
							FROM Delivery d INNER JOIN SubOrder o ON d.suborder_id=o.suborder_id
							WHERE d.delivery_id = @delivery_id)

	UPDATE Orders
	SET status = 'In Progress'
	WHERE order_id IN ( SELECT o.order_id
						FROM Delivery d 
						INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
						INNER JOIN Orders o ON so.order_id = o.order_id
						WHERE d.delivery_id = @delivery_id)

	RETURN 0;
END
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE PROCEDURE Mark_Delivered
	@delivery_id INT
AS
BEGIN
	IF @delivery_id NOT IN (SELECT delivery_id FROM Delivery)
	BEGIN
	RETURN -1;
	END

	DECLARE @so_state VARCHAR(20);
	DECLARE @so_id INT;
	DECLARE @o_id INT;
	DECLARE @o_state VARCHAR(20);

	SELECT @so_state = so.status,@o_id = so.order_id,@o_state = o.status,@so_id = so.suborder_id
	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id INNER JOIN Orders o 
	ON so.order_id = o.order_id
	WHERE d.delivery_id = @delivery_id

	IF @so_state <> 'Picked Up' OR @o_state <> 'In Progress'
	BEGIN
	RETURN -4;
	END

	UPDATE SubOrder
	SET status = 'Delivered'
	WHERE suborder_id = @so_id

	UPDATE Delivery
	SET delivered_at = GETDATE(), tracking_time = DATEDIFF(MINUTE,picked_up_at,GETDATE())
	WHERE delivery_id = @delivery_id;

	UPDATE Orders
	SET status = 'Delivered'
	WHERE order_id=@o_id AND NOT EXISTS(SELECT so.suborder_id
	FROM SubOrder so
	WHERE so.order_id = @o_id AND so.status <> 'Delivered' AND so.status <> 'Canceled'
	)
	AND EXISTS(SELECT so.suborder_id
	FROM SubOrder so
	WHERE so.order_id = @o_id AND so.status = 'Delivered'
	)
	RETURN 0;
END
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Earnings(@rider_id INT, @from_date DATE, @to_date DATE)
	RETURNS TABLE
AS
RETURN(
	SELECT COUNT(*) AS completed_deliveries,SUM(so.delivery_fee) AS total_delivery_fees,
	SUM(0.8 * so.delivery_fee) AS total_earnings

	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	WHERE d.rider_id = @rider_id AND CAST(d.delivered_at AS DATE) >= @from_date 
	AND CAST(d.delivered_at AS DATE) <= @to_date AND so.status = 'Delivered' 
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Rating_Summary(@rider_id INT)
RETURNS TABLE
AS
RETURN(
	SELECT AVG(f.rating) AS avg_rating ,COUNT(f.rating) AS ratings_count,
	COUNT(CASE WHEN f.rating = 5 THEN 1 END) AS five_star,
	COUNT(CASE WHEN f.rating = 4 THEN 1 END) AS four_star,
	COUNT(CASE WHEN f.rating = 3 THEN 1 END) AS three_star,
	COUNT(CASE WHEN f.rating = 2 THEN 1 END) AS two_star,
	COUNT(CASE WHEN f.rating = 1 THEN 1 END) AS one_star

	FROM Rider r LEFT OUTER JOIN (Delivery d 
	INNER JOIN(SubOrder so LEFT OUTER JOIN Feedback f ON f.suborder_id = so.suborder_id) 
	ON so.suborder_id = d.suborder_id) ON r.rider_id = d.rider_id
	WHERE r.rider_id = @rider_id
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION My_Delivery_History(@rider_id INT,@from_date DATE, @to_date DATE)
RETURNS TABLE
AS
RETURN(
	
	SELECT d.delivery_id,o.order_id,b.name AS business_name,so.status,
	d.assigned_at,d.picked_up_at,d.delivered_at,d.tracking_time
	FROM Delivery d INNER JOIN SubOrder so ON d.suborder_id = so.suborder_id
	INNER JOIN Orders o ON o.order_id = so.order_id
	INNER JOIN Business b ON so.business_id = b.business_id
	WHERE d.rider_id = @rider_id AND so.status IN ('Delivered','Cancelled')
			AND CAST(d.assigned_at AS DATE) >= @from_date AND CAST(d.assigned_at AS DATE) <=@to_date

)
GO


--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.Search_Platform (@customer_id INT, @keyword VARCHAR(100))
RETURNS TABLE
AS 
RETURN(
SELECT TOP 100 PERCENT B.business_id, B.name AS business_name, CASE WHEN B.name = @keyword THEN 1 
WHEN B.name LIKE @keyword + '%' THEN 2 ELSE 3 END AS priority
FROM Business B
INNER JOIN Address A ON B.zone_id = A.zone_id
WHERE A.customer_id = @customer_id AND A.is_active = 1 AND B.status = 'Active'
AND @keyword IS NOT NULL AND LTRIM(RTRIM(@keyword)) <> '' AND B.name LIKE '%' + @keyword + '%'
ORDER BY priority ASC
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION Reconcile_Order_Totals()
RETURNS TABLE
AS
RETURN(
	SELECT * 
	FROM (SELECT o.order_id,
	SUM(so.total_price + so.delivery_fee) - o.discount_amount AS expected_total,
	o.total_amount AS order_total,
	p.amount AS payment_amount
	FROM (Orders o INNER JOIN SubOrder so ON o.order_id=so.order_id)
	LEFT OUTER JOIN Payment p ON o.order_id = p.order_id 
	GROUP BY o.order_id,o.total_amount,p.amount
	) AS T
	WHERE T.expected_total <> T.order_total OR T.payment_amount is NULL OR T.payment_amount <>T.order_total

);
GO


--Ziad Yasser Ibrahim 65-33790

CREATE FUNCTION dbo.Nearby_Businesses_By_Category(@address_id INT, @product_category VARCHAR(50))
RETURNS TABLE
AS
RETURN(
SELECT B.business_id, B.name AS business_name, Z.zone_name, CASE WHEN B.zone_id = A.zone_id
THEN 1 ELSE 0 END AS same_zone, (SELECT AVG(B2.expected_delivery_time) FROM Business B2
WHERE B2.zone_id = B.zone_id AND B2.status = 'Active') AS zone_avg_delivery_time
FROM Business B 
INNER JOIN Zone Z ON B.zone_id = Z.zone_id
INNER JOIN Address A ON A.address_id = @address_id
WHERE @product_category IS NOT NULL AND B.status = 'Active' AND EXISTS 
(SELECT * FROM Product P WHERE B.business_id = P.business_id AND P.is_available = 1  AND P.category = @product_category)
);
GO


﻿-- Omar Waleed El-sayed 64-29234

GO
CREATE FUNCTION Platform_Health_Snapshot()
RETURNS TABLE
AS
RETURN(
	SELECT (SELECT COUNT(*) FROM Business WHERE status = 'Active') AS active_businesses,
	(SELECT COUNT(*) FROM Rider WHERE is_available=1) AS available_riders,
	(SELECT COUNT(*) FROM Orders WHERE CAST(order_date AS DATE) = CAST(GETDATE() AS DATE)) AS orders_today,
	(SELECT AVG(tracking_time) FROM Delivery WHERE CAST(delivered_at AS DATE) = CAST(GETDATE() AS DATE)) AS avg_delivery_time_today,
	(SELECT COUNT(*) FROM Feedback WHERE rating <=2 AND CAST(feedback_date AS DATE) = CAST(GETDATE() AS DATE)) AS low_ratings_today
)
GO
