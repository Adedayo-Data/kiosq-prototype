#!/bin/sh
set -e

# If Render injects DATABASE_URL or INTERNAL_DATABASE_URL (format: postgres://user:password@host:port/dbname)
DB_URL_SOURCE="${DATABASE_URL:-$INTERNAL_DATABASE_URL}"

if [ -n "$DB_URL_SOURCE" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
  echo "=> Detected cloud database URL. Converting to Spring Boot JDBC parameters..."
  AFTER_PROTO=$(echo "$DB_URL_SOURCE" | sed -E 's|^postgres(ql)?://||')

  if echo "$AFTER_PROTO" | grep -q "@"; then
    USER_PASS=$(echo "$AFTER_PROTO" | cut -d'@' -f1)
    HOST_PORT_DB=$(echo "$AFTER_PROTO" | cut -d'@' -f2)
    
    DB_USER=$(echo "$USER_PASS" | cut -d':' -f1)
    DB_PASS=$(echo "$USER_PASS" | cut -d':' -f2-)
    
    export SPRING_DATASOURCE_URL="jdbc:postgresql://${HOST_PORT_DB}"
    export SPRING_DATASOURCE_USERNAME="${DB_USER}"
    export SPRING_DATASOURCE_PASSWORD="${DB_PASS}"
    echo "=> Set SPRING_DATASOURCE_URL to jdbc:postgresql://${HOST_PORT_DB} (User: ${DB_USER})"
  else
    export SPRING_DATASOURCE_URL="jdbc:postgresql://${AFTER_PROTO}"
    echo "=> Set SPRING_DATASOURCE_URL to jdbc:postgresql://${AFTER_PROTO}"
  fi
fi

# Launch Spring Boot with container-aware memory allocation
echo "=> Launching Kiosq backend on port ${PORT:-8080}..."
exec java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar "$@"
