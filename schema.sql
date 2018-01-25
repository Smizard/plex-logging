CREATE DATABASE  IF NOT EXISTS `plex-logging` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `plex-logging`;
-- MySQL dump 10.13  Distrib 5.7.21, for Linux (x86_64)
--
-- Host: localhost    Database: plexlogtest
-- ------------------------------------------------------
-- Server version	5.7.21-0ubuntu0.17.10.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Episodes`
--

DROP TABLE IF EXISTS `Episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Episodes` (
  `Season` int(10) unsigned NOT NULL,
  `TSID` varchar(80) NOT NULL,
  `Title` varchar(80) DEFAULT NULL,
  `Episode` int(10) unsigned NOT NULL,
  `LastUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Season`,`Episode`,`TSID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MovieWatches`
--

DROP TABLE IF EXISTS `MovieWatches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MovieWatches` (
  `StartTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UID` int(10) unsigned NOT NULL,
  `MID` varchar(80) NOT NULL,
  `PID` varchar(80) NOT NULL,
  `Duration` int(10) unsigned DEFAULT NULL,
  `Scrobbled` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`StartTime`,`UID`,`MID`,`PID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Movies`
--

DROP TABLE IF EXISTS `Movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Movies` (
  `ID` varchar(80) NOT NULL,
  `Title` varchar(80) DEFAULT NULL,
  `Duration` int(10) unsigned DEFAULT NULL,
  `Year` int(10) unsigned DEFAULT NULL,
  `Rating` double unsigned DEFAULT NULL,
  `ContentRating` varchar(45) DEFAULT NULL,
  `LastUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `id_UNIQUE` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Players`
--

DROP TABLE IF EXISTS `Players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Players` (
  `ID` varchar(80) NOT NULL,
  `Title` varchar(80) DEFAULT NULL,
  `LastUpdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TVShowWatches`
--

DROP TABLE IF EXISTS `TVShowWatches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TVShowWatches` (
  `StartTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UID` int(10) unsigned NOT NULL,
  `TSID` varchar(80) NOT NULL,
  `PID` varchar(80) NOT NULL,
  `EID` int(10) unsigned NOT NULL,
  `Duration` int(10) unsigned DEFAULT NULL,
  `Scrobbled` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`StartTime`,`UID`,`TSID`,`PID`,`EID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TVShows`
--

DROP TABLE IF EXISTS `TVShows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TVShows` (
  `ID` varchar(80) NOT NULL,
  `Title` varchar(80) DEFAULT NULL,
  `Year` int(10) unsigned DEFAULT NULL,
  `Rating` double DEFAULT NULL,
  `ContentRating` varchar(50) DEFAULT NULL,
  `LastUpdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `ID` int(10) unsigned NOT NULL,
  `Title` varchar(80) DEFAULT NULL,
  `LastUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-24 17:22:26
