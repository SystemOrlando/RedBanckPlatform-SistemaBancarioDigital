# Etapa 1: compilación
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# Etapa 2: runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S redbanck && adduser -S redbanck -G redbanck
USER redbanck
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
