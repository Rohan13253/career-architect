# 1. Build Stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Run Stage
# We use eclipse-temurin:17-jre (Java Runtime Environment)
# because the old 'openjdk' image you used is deleted.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render sets the PORT variable automatically
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]