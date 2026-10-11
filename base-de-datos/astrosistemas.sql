-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Database: astro_sistemas
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `acceso_grupo`
--

DROP TABLE IF EXISTS `acceso_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acceso_grupo` (
  `id_acceso_grupo` bigint NOT NULL AUTO_INCREMENT,
  `Id_grupo` int NOT NULL,
  `Id_puerta` int NOT NULL,
  PRIMARY KEY (`id_acceso_grupo`),
  UNIQUE KEY `uk_grupo_puerta` (`Id_grupo`,`Id_puerta`),
  KEY `Id_puerta` (`Id_puerta`),
  CONSTRAINT `acceso_grupo_ibfk_1` FOREIGN KEY (`Id_grupo`) REFERENCES `grupo` (`Id_grupo`),
  CONSTRAINT `acceso_grupo_ibfk_2` FOREIGN KEY (`Id_puerta`) REFERENCES `puerta` (`Id_puerta`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acceso_grupo`
--

LOCK TABLES `acceso_grupo` WRITE;
/*!40000 ALTER TABLE `acceso_grupo` DISABLE KEYS */;
INSERT INTO `acceso_grupo` VALUES (34,13,12),(35,13,13),(70,13,14),(71,13,15),(68,13,16),(36,13,18),(37,13,19),(67,13,20),(38,13,21),(69,13,22),(39,14,12),(40,14,13),(41,14,17),(42,14,18),(43,14,19),(44,14,21),(45,15,12),(46,15,13),(47,15,15),(48,15,16),(49,15,19),(50,15,20),(51,15,21),(52,16,12),(53,16,13),(54,16,14),(55,16,15),(56,16,16),(57,16,17),(58,16,18),(59,16,19),(60,16,20),(63,18,12),(64,18,19),(65,18,20),(66,18,21);
/*!40000 ALTER TABLE `acceso_grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `area`
--

DROP TABLE IF EXISTS `area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `area` (
  `Id_area` int NOT NULL AUTO_INCREMENT,
  `Nombre_area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id_area`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `area`
--

LOCK TABLES `area` WRITE;
/*!40000 ALTER TABLE `area` DISABLE KEYS */;
INSERT INTO `area` VALUES (5,'Bloque A - Administrativo'),(6,'Bloque B - Laboratorios'),(7,'Bloque C - Biblioteca'),(8,'Bloque D - Aulas');
/*!40000 ALTER TABLE `area` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_edicion`
--

DROP TABLE IF EXISTS `auditoria_edicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_edicion` (
  `id_auditoria_edicion` bigint NOT NULL AUTO_INCREMENT,
  `Tabla_afectada` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Campo_editado` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Valor_anterior` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Valor_nuevo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `Id_admin` bigint DEFAULT NULL,
  `Fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria_edicion`),
  KEY `Id_admin` (`Id_admin`),
  CONSTRAINT `auditoria_edicion_ibfk_1` FOREIGN KEY (`Id_admin`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_edicion`
--

LOCK TABLES `auditoria_edicion` WRITE;
/*!40000 ALTER TABLE `auditoria_edicion` DISABLE KEYS */;
INSERT INTO `auditoria_edicion` VALUES (9,'usuario','Estatus','Activo','Inactivo',NULL,'2026-06-28 22:33:07'),(10,'grupo','Estatus','Activo','Inactivo',NULL,'2026-06-28 22:38:16'),(11,'usuario','Cedula','8-123-456','8-1030-2049',NULL,'2026-06-29 00:04:17'),(12,'usuario','Estatus','Inactivo','Activo',NULL,'2026-06-29 00:04:17'),(13,'grupo','Estatus','Inactivo','Activo',NULL,'2026-06-29 00:15:19'),(14,'grupo','Estatus','Activo','Inactivo',NULL,'2026-06-29 00:20:30'),(15,'acceso_grupo','Id_puerta','Grupo 16 → Puerta 22 ELIMINADA',NULL,1,'2026-06-29 00:20:30'),(16,'acceso_grupo','Id_puerta','Grupo 16 → Puerta 21 ELIMINADA',NULL,1,'2026-06-29 00:20:30'),(17,'usuario','Estatus','Activo','Inactivo',1,'2026-06-30 00:23:34'),(18,'grupo','Estatus','Activo','Inactivo',NULL,'2026-06-30 00:23:55'),(19,'acceso_grupo','Id_puerta',NULL,'Grupo 13 → Puerta 22 AGREGADA',1,'2026-06-30 00:23:55'),(20,'usuario','Estatus','Inactivo','Activo',1,'2026-07-09 00:25:15'),(21,'grupo','Estatus','Inactivo','Activo',NULL,'2026-07-09 00:26:55'),(22,'acceso_grupo','Id_puerta',NULL,'Grupo 13 → Puerta 15 AGREGADA',1,'2026-07-09 00:26:55'),(23,'acceso_grupo','Id_puerta',NULL,'Grupo 13 → Puerta 14 AGREGADA',1,'2026-07-09 00:26:55'),(24,'grupo','Estatus','Activo','Inactivo',NULL,'2026-09-22 21:09:37'),(25,'usuarios','password','***','Contraseña restablecida por recuperación vía correo',1,'2026-09-24 08:25:41');
/*!40000 ALTER TABLE `auditoria_edicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_login`
--

DROP TABLE IF EXISTS `auditoria_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_login` (
  `id_auditoria_login` bigint NOT NULL AUTO_INCREMENT,
  `Id_admin` bigint NOT NULL,
  `Fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `Resultado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_auditoria_login`),
  KEY `Id_admin` (`Id_admin`),
  CONSTRAINT `auditoria_login_ibfk_1` FOREIGN KEY (`Id_admin`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_login`
--

LOCK TABLES `auditoria_login` WRITE;
/*!40000 ALTER TABLE `auditoria_login` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `Id_grupo` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Estatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Activo',
  PRIMARY KEY (`Id_grupo`),
  UNIQUE KEY `Codigo` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
INSERT INTO `grupo` VALUES (13,'G-101','Ingenieria Civil','Activo'),(14,'G-102','Ingenieria Mecanica','Activo'),(15,'G-201','Sistemas Computacionales','Inactivo'),(16,'G-301','Administracion','Inactivo'),(17,'G-401','Derecho','Inactivo'),(18,'G-501','Medicina','Activo');
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_expiracion` bigint NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_creacion` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puerta`
--

DROP TABLE IF EXISTS `puerta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puerta` (
  `Id_puerta` int NOT NULL AUTO_INCREMENT,
  `Nombre_puerta` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_area` int NOT NULL,
  PRIMARY KEY (`Id_puerta`),
  KEY `Id_area` (`Id_area`),
  CONSTRAINT `puerta_ibfk_1` FOREIGN KEY (`Id_area`) REFERENCES `area` (`Id_area`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puerta`
--

LOCK TABLES `puerta` WRITE;
/*!40000 ALTER TABLE `puerta` DISABLE KEYS */;
INSERT INTO `puerta` VALUES (12,'Entrada Principal A',5),(13,'Entrada Secundaria A',5),(14,'Oficinas Admin',5),(15,'Lab Computo 1',6),(16,'Lab Computo 2',6),(17,'Lab Electronica',6),(18,'Lab Mecanica',6),(19,'Biblioteca General',7),(20,'Sala de Estudios',7),(21,'Aulas Generales',8),(22,'Salon de Conferencias',8);
/*!40000 ALTER TABLE `puerta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` bigint NOT NULL AUTO_INCREMENT,
  `Cedula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Id_grupo` int NOT NULL,
  `Estatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Activo',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `Cedula` (`Cedula`),
  KEY `Id_grupo` (`Id_grupo`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`Id_grupo`) REFERENCES `grupo` (`Id_grupo`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (49,'8-1030-2049',13,'Activo'),(50,'8-234-567',13,'Activo'),(51,'8-345-678',13,'Inactivo'),(52,'8-456-789',13,'Activo'),(53,'4-567-890',14,'Activo'),(54,'4-678-901',14,'Activo'),(55,'4-789-012',14,'Inactivo'),(56,'6-789-012',15,'Activo'),(57,'6-890-123',15,'Activo'),(58,'6-901-234',15,'Activo'),(59,'6-012-345',15,'Inactivo'),(60,'9-234-567',16,'Activo'),(61,'9-345-678',16,'Activo'),(62,'2-345-678',18,'Activo'),(63,'2-456-789',18,'Activo'),(64,'2-567-890',18,'Inactivo');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `fecha_creacion` bigint DEFAULT NULL,
  `rol` enum('ADMIN','USER','AUDITOR','CONSULTOR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','$2b$10$dWnTWHCBzS1T0MZ5JAHvWu0CwABg5WZ8205QBDOXYURAtKE0WiHwm','admin@astrosistemas.test','Administrador Principal',1,1782635250000,'ADMIN'),(2,'supervisor','$2b$10$IMHxkAOlDSafxjACx/iakevwiHUGLtkcxCZR4WB.nG/A4gV4G0Co2','supervisor@astro.local','Supervisor de Accesos',1,1782635250000,'USER'),(3,'auditor','$2b$10$a2zv4r2LkAj85oDfW3h93O/2kfA3HXIgDlbkAvcdFLX/CWO3vOsa2','auditor@astro.local','Auditor del Sistema',1,1782635250000,'AUDITOR'),(4,'user1','$2b$10$YYYF.9trepmxuZYDT0sP7.cAfION/PrXQ0u0YqJDtsAiHW75RpnlO','user1@astro.com','Usuario de Prueba',1,1783512611000,'USER'),(5,'auditor1','$2b$10$evnMXVKTOWDmayFYdVghCeIEZougV/wOtgudu6gUXfYPe.Wh2NCYG','auditor1@astro.com','Auditor de Prueba',1,1783512611000,'AUDITOR'),(6,'consultor1','$2b$10$hRI6YCkNTb9UPnGavIZRg.hmMNSrFcbQwfPDjRZY8YcRJiWhQ4j7O','consultor1@astro.com','Consultor de Prueba',1,1783512611000,'CONSULTOR'),(7,'asbel','$2b$10$G9qDEMcJFlKNnVSRDNjNkuHWqvkbdq8cgcXsL3rmww4vrhlVe4j0G','asbel@astrosistemas.test','Asbel Johnson',1,1790637088000,'ADMIN');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-11 13:46:27