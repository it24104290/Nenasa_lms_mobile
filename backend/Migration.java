import java.io.*;
import java.nio.file.*;

public class Migration {
    public static void main(String[] args) throws Exception {
        String baseDir = "c:\\Users\\chami\\OneDrive\\Desktop\\nanasa lms webpage\\backend";

        // 1. pom.xml
        Path pomPath = Paths.get(baseDir, "pom.xml");
        String pomContent = new String(Files.readAllBytes(pomPath));
        pomContent = pomContent.replace("<artifactId>spring-boot-starter-data-jpa</artifactId>",
                "<artifactId>spring-boot-starter-data-mongodb</artifactId>");
        pomContent = pomContent.replaceAll(
                "<dependency>\\s*<groupId>org.postgresql</groupId>\\s*<artifactId>postgresql</artifactId>[\\s\\S]*?</dependency>",
                "");
        Files.write(pomPath, pomContent.getBytes());

        // 2. properties
        Path propsPath = Paths.get(baseDir, "src/main/resources/application.properties");
        String props = "server.port=8080\nspring.data.mongodb.uri=mongodb+srv://ps:<db_password>@cluster0.si0a6ee.mongodb.net/nanasa?appName=Cluster0\njwt.secret=9a4f2c8d3b7a1e6f45c8a0b3f267d8b1d4e6f3c8a9d2b5f8e3a9c8b5f6v8a3d9\njwt.expiration=86400000\ncors.allowed-origins=http://localhost:5173,http://localhost:5174\n";
        Files.write(propsPath, props.getBytes());

        // 3. source
        Path srcDir = Paths.get(baseDir, "src/main/java/com/nanasa/nanasa_lms");
        Files.walk(srcDir)
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .forEach(p -> {
                    try {
                        String content = new String(Files.readAllBytes(p));

                        if (p.toString().contains("model")) {
                            content = content.replaceAll("import\\s+jakarta\\.persistence\\.\\*;?",
                                    "import org.springframework.data.annotation.Id;\nimport org.springframework.data.mongodb.core.mapping.Document;\nimport org.springframework.data.mongodb.core.mapping.DBRef;");
                            String filename = p.getFileName().toString().replace(".java", "").toLowerCase() + "s";
                            content = content.replace("@Entity", "@Document(collection = \"" + filename + "\")");
                            content = content.replaceAll("@Table\\(name\\s*=[^)]+\\)", "");
                            content = content.replaceAll("@GeneratedValue\\([^)]+\\)", "");
                            content = content.replaceAll("@Column\\([^)]*\\)\\s*", "");
                            content = content.replaceAll("@Column\\s*", "");
                            content = content.replaceAll("@OneToMany\\([^)]*\\)\\s*", "");
                            content = content.replaceAll("@ManyToOne\\([^)]*\\)\\s*", "@DBRef\n    ");
                            content = content.replaceAll("@ManyToOne\\s*", "@DBRef\n    ");
                            content = content.replaceAll("@ManyToMany\\([^)]*\\)\\s*", "@DBRef\n    ");
                            content = content.replaceAll("@OneToOne\\([^)]*\\)\\s*", "@DBRef\n    ");
                            content = content.replaceAll("@JoinColumn\\([^)]*\\)\\s*", "");
                            content = content.replaceAll("@JoinTable\\([\\s\\S]*?\\)\\s*(?=private)", "");
                        }

                        if (p.toString().contains("repository")) {
                            content = content.replace("import org.springframework.data.jpa.repository.JpaRepository;",
                                    "import org.springframework.data.mongodb.repository.MongoRepository;");
                            content = content.replace("JpaRepository", "MongoRepository");
                        }

                        content = content.replaceAll("\\bLong\\s+id\\b", "String id");
                        content = content.replaceAll("\\bLong\\s+examId\\b", "String examId");
                        content = content.replaceAll("\\bLong\\s+studentId\\b", "String studentId");
                        content = content.replaceAll("\\bLong\\s+teacherId\\b", "String teacherId");
                        content = content.replaceAll("\\bLong\\s+subjectId\\b", "String subjectId");
                        content = content.replaceAll("\\bLong\\s+classId\\b", "String classId");
                        content = content.replaceAll("Map<Long,\\s*String>", "Map<String, String>");
                        content = content.replaceAll("<([A-Za-z0-9_]+),\\s*Long>", "<$1, String>");

                        Files.write(p, content.getBytes());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
    }
}
