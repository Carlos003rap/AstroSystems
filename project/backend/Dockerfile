# El contexto de construccion es la carpeta "project" (no "project/backend"),
# porque el backend tambien empaqueta las paginas de frontend/html
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
COPY frontend/html /app/frontend/html
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/sistemas-1.0.0.jar app.jar
ENV JAVA_TOOL_OPTIONS="-Xmx300m -XX:+UseSerialGC"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
