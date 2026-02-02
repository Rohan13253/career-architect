# backend-java/Dockerfile
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# No need for EXPOSE 8080, Render handles this dynamically

# --- FIXED LINE BELOW ---
# We add "-Dserver.port=${PORT}" so Spring Boot listens on the port Render gives it
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]