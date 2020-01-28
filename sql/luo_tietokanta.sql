-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 07.01.2020 klo 09:14
-- Palvelimen versio: 10.3.16-MariaDB
-- PHP Version: 7.3.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `omatyonhaku`
--
CREATE DATABASE IF NOT EXISTS `omatyonhaku` DEFAULT CHARACTER SET utf8 COLLATE utf8_swedish_ci;
USE `omatyonhaku`;

-- --------------------------------------------------------

--
-- Rakenne taululle `kayttajat`
--

CREATE TABLE IF NOT EXISTS `kayttajat` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `tunnus` text COLLATE utf8_swedish_ci NOT NULL,
  `salasana` text COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Rakenne taululle `muistiinpanot`
--

CREATE TABLE IF NOT EXISTS `muistiinpanot` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `kayttajaId` smallint(6) NOT NULL,
  `tehtavaId` smallint(6) NOT NULL,
  `pvm` bigint(13) NOT NULL,
  `viesti` text COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

-- --------------------------------------------------------

--
-- Rakenne taululle `tehtava`
--

CREATE TABLE IF NOT EXISTS `tehtava` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `kayttajaId` smallint(6) NOT NULL,
  `otsikko` text COLLATE utf8_swedish_ci NOT NULL,
  `yritys` text COLLATE utf8_swedish_ci NOT NULL,
  `haettuPvm` bigint(13) NOT NULL,
  `paattyyPvm` bigint(13) NOT NULL,
  `nimi` text COLLATE utf8_swedish_ci NOT NULL,
  `tel` text COLLATE utf8_swedish_ci NOT NULL,
  `email` text COLLATE utf8_swedish_ci NOT NULL,
  `linkki` text COLLATE utf8_swedish_ci NOT NULL,
  `tiedosto` text COLLATE utf8_swedish_ci NOT NULL,
  `luotu` bigint(13) NOT NULL,
  `status` text COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
