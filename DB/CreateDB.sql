-- Delete and recreate DB
DROP DATABASE IF EXISTS find_your_internship;
CREATE DATABASE find_your_internship;
USE find_your_internship;

-- Tables
CREATE TABLE Skills(
   IdSkills INT AUTO_INCREMENT,
   Skill VARCHAR(50) NOT NULL,
   PRIMARY KEY(IdSkills)
);

CREATE TABLE Countries(
   Id_Country INT AUTO_INCREMENT,
   CountryName VARCHAR(50),
   PRIMARY KEY(Id_Country)
);

CREATE TABLE Category(
   Id_Category INT AUTO_INCREMENT,
   CategoryName VARCHAR(50) NOT NULL,
   PRIMARY KEY(Id_Category)
);

CREATE TABLE Technologies(
   Id_Technologies INT AUTO_INCREMENT,
   TechName VARCHAR(50) NOT NULL,
   PRIMARY KEY(Id_Technologies)
);

CREATE TABLE Users(
   IdUser INT AUTO_INCREMENT,
   FirstName VARCHAR(50) NOT NULL,
   LastName VARCHAR(50) NOT NULL,
   Email VARCHAR(50) NOT NULL,
   Password VARCHAR(50) NOT NULL,
   UserPhone VARCHAR(20),
   DoB DATE NOT NULL,
   JoinDate DATE NOT NULL,
   Id_Country INT NOT NULL,
   PRIMARY KEY(IdUser),
   FOREIGN KEY(Id_Country) REFERENCES Countries(Id_Country)
);

CREATE TABLE Companies(
   IdCompany INT AUTO_INCREMENT,
   Name VARCHAR(50) NOT NULL,
   Description VARCHAR(255),
   Email VARCHAR(50) NOT NULL,
   Phone VARCHAR(20),
   Id_Country INT NOT NULL,
   PRIMARY KEY(IdCompany),
   FOREIGN KEY(Id_Country) REFERENCES Countries(Id_Country)
);

CREATE TABLE Admin(
   IdUser INT,
   PRIMARY KEY(IdUser),
   FOREIGN KEY(IdUser) REFERENCES Users(IdUser)
);

CREATE TABLE Pilot(
   IdUser INT,
   PRIMARY KEY(IdUser),
   FOREIGN KEY(IdUser) REFERENCES Users(IdUser)
);

CREATE TABLE Student(
   IdUser_1 INT,
   SchoolLevel VARCHAR(50),
   SchoolYear INT,
   Major VARCHAR(50),
   IdUser INT NOT NULL,
   PRIMARY KEY(IdUser_1),
   FOREIGN KEY(IdUser_1) REFERENCES Users(IdUser),
   FOREIGN KEY(IdUser) REFERENCES Pilot(IdUser)
);

CREATE TABLE Internships(
   IdInternship INT AUTO_INCREMENT,
   Title VARCHAR(50) NOT NULL,
   Description VARCHAR(255),
   DateOfCreation DATE NOT NULL,
   Budget DECIMAL(10,2),
   Time_ INT,
   Id_Category INT NOT NULL,
   IdCompany INT NOT NULL,
   PRIMARY KEY(IdInternship),
   FOREIGN KEY(Id_Category) REFERENCES Category(Id_Category),
   FOREIGN KEY(IdCompany) REFERENCES Companies(IdCompany)
);

CREATE TABLE WishList(
   IdInternship INT,
   IdUser INT,
   PRIMARY KEY(IdInternship, IdUser),
   FOREIGN KEY(IdInternship) REFERENCES Internships(IdInternship),
   FOREIGN KEY(IdUser) REFERENCES Student(IdUser_1)
);

CREATE TABLE Application(
   IdInternship INT,
   IdUser INT,
   PRIMARY KEY(IdInternship, IdUser),
   FOREIGN KEY(IdInternship) REFERENCES Internships(IdInternship),
   FOREIGN KEY(IdUser) REFERENCES Student(IdUser_1)
);

CREATE TABLE RatingAdmin(
   IdCompany INT,
   IdUser INT,
   Rating TINYINT,
   RatingText VARCHAR(50),
   PRIMARY KEY(IdCompany, IdUser),
   FOREIGN KEY(IdCompany) REFERENCES Companies(IdCompany),
   FOREIGN KEY(IdUser) REFERENCES Admin(IdUser)
);

CREATE TABLE RatingPilot(
   IdCompany INT,
   IdUser INT,
   Rating TINYINT NOT NULL,
   RatingText VARCHAR(50),
   PRIMARY KEY(IdCompany, IdUser),
   FOREIGN KEY(IdCompany) REFERENCES Companies(IdCompany),
   FOREIGN KEY(IdUser) REFERENCES Pilot(IdUser)
);

CREATE TABLE InternshipSkillNeeds(
   IdInternship INT,
   IdSkills INT,
   PRIMARY KEY(IdInternship, IdSkills),
   FOREIGN KEY(IdInternship) REFERENCES Internships(IdInternship),
   FOREIGN KEY(IdSkills) REFERENCES Skills(IdSkills)
);

CREATE TABLE IntershipsTechs(
   IdInternship INT,
   Id_Technologies INT,
   PRIMARY KEY(IdInternship, Id_Technologies),
   FOREIGN KEY(IdInternship) REFERENCES Internships(IdInternship),
   FOREIGN KEY(Id_Technologies) REFERENCES Technologies(Id_Technologies)
);