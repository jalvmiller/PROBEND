# BUILD da aplicação, Maven + JDK25
# WORKDIR vai definir o diretório de trabalho (/app) dentro do container
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY . /app
# Executar a build Maven dentro do container
# -B = modo batch
RUN ./mvn -B -DskipTests package

# Rodar com uma imagem JRE
# COPY puxa todos os arquivos da pasta backend pra /app
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/sistemasquestoes-0.0.1-SNAPSHOT.jar app.jar

# A aplicação roda nessa porta
EXPOSE 8080

CMD ["java", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]