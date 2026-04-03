if (-Not (Test-Path "apache-maven-3.9.6")) {
    Write-Host "Downloading portable Maven distributions..."
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile "maven.zip"
    Write-Host "Extracting Maven binaries..."
    Expand-Archive -Path "maven.zip" -DestinationPath "." -Force
    Remove-Item "maven.zip"
}

Write-Host "Compiling and starting Spring Boot using portable Maven..."
$env:Path += ";$PWD\apache-maven-3.9.6\bin"
mvn clean compile -DskipTests
mvn spring-boot:run
