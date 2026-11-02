FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built Spring Boot fat JAR (multi-stage-free simple Dockerfile)
COPY target/campusfix-api-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
