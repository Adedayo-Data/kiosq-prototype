# ----------------------------------------------------
# Stage 1: Build the Spring Boot application using Maven
# ----------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests

# ----------------------------------------------------
# Stage 2: Minimal runtime image with Eclipse Temurin JRE 21
# ----------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled jar from builder stage
COPY --from=builder /app/target/kiosq-0.0.1-SNAPSHOT.jar /app/app.jar

# Copy entrypoint script that handles Render DATABASE_URL format
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Render dynamically binds to $PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
