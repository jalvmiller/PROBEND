# BUILD da aplicação, Maven + JDK25
# WORKDIR vai definir o diretório de trabalho (/app) dentro do container
FROM maven:3.9.8-eclipse-temurin-25 AS build
WORKDIR /app
COPY . /app
# Executar a build Maven dentro do container
# -B = modo batch
RUN ./mvnw -B -DskipTests package

# Rodar com uma imagem JRE
# COPY puxa todos os arquivos da pasta backend pra /app
FROM eclipse-temurin:25-jre-jammy
WORKDIR /app
COPY --from=build /app/target/sistemasquestoes-0.0.1-SNAPSHOT.jar app.jar

# A aplicação roda nessa porta
EXPOSE 8080

# Variáveis de ambiente
ENV DB_USER=root
ENV DB_PASSWORD=1234
ENV JWT_SECRET=ChavePadraoParaDesenvolvimentoApenas
CMD ["java", "-jar", "app.jar"]