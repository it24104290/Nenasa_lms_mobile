const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

try {
    // 1. pom.xml
    const pomPath = path.join(baseDir, 'pom.xml');
    let pomContent = fs.readFileSync(pomPath, 'utf8');
    pomContent = pomContent.replace('<artifactId>spring-boot-starter-data-jpa</artifactId>', '<artifactId>spring-boot-starter-data-mongodb</artifactId>');
    pomContent = pomContent.replace(/<dependency>\s*<groupId>org\.postgresql<\/groupId>\s*<artifactId>postgresql<\/artifactId>[\s\S]*?<\/dependency>/, '');
    fs.writeFileSync(pomPath, pomContent);
    console.log('Updated pom.xml');

    // 2. application.properties
    const propsPath = path.join(baseDir, 'src', 'main', 'resources', 'application.properties');
    const props = `spring.application.name=Nanasa LMS
server.port=8080
spring.data.mongodb.uri=mongodb+srv://ps:<db_password>@cluster0.si0a6ee.mongodb.net/nanasa?appName=Cluster0
nanasa.jwt.secret=9a4f2c8d3b7a1e6f45c8a0b3f267d8b1d4e6f3c8a9d2b5f8e3a9c8b5f6v8a3d9
nanasa.jwt.expiration-ms=86400000
nanasa.cors.allowed-origins=http://localhost:3000,http://localhost:5173,http://localhost:8080
`;
    fs.writeFileSync(propsPath, props);
    console.log('Updated application.properties');

    // 3. source
    const srcDir = path.join(baseDir, 'src', 'main', 'java', 'com', 'nanasa', 'nanasa_lms');

    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkDir(fullPath);
            } else if (fullPath.endsWith('.java')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;

                if (fullPath.includes('model')) {
                    content = content.replace(/import\s+jakarta\.persistence\.\*[;]?/g,
                        'import org.springframework.data.annotation.Id;\nimport org.springframework.data.mongodb.core.mapping.Document;\nimport org.springframework.data.mongodb.core.mapping.DBRef;');

                    const filename = file.replace('.java', '').toLowerCase() + 's';
                    content = content.replace(/@Entity/g, `@Document(collection = "${filename}")`);
                    content = content.replace(/@Table\([^)]*\)/g, '');
                    content = content.replace(/@GeneratedValue\([^)]*\)/g, '');
                    content = content.replace(/@Column\([^)]*\)\s*/g, '');
                    content = content.replace(/@Column\s*/g, '');
                    content = content.replace(/@OneToMany\([^)]*\)\s*/g, '');
                    content = content.replace(/@ManyToOne\([^)]*\)\s*/g, '@DBRef\n    ');
                    content = content.replace(/@ManyToOne\s*/g, '@DBRef\n    ');
                    content = content.replace(/@ManyToMany\([^)]*\)\s*/g, '@DBRef\n    ');
                    content = content.replace(/@OneToOne\([^)]*\)\s*/g, '@DBRef\n    ');
                    content = content.replace(/@JoinColumn\([^)]*\)\s*/g, '');
                    content = content.replace(/@JoinTable\([\s\S]*?\)\s*(?=private)/g, '');
                    modified = true;
                }

                if (fullPath.includes('repository')) {
                    content = content.replace(/import\s+org\.springframework\.data\.jpa\.repository\.JpaRepository;/g,
                        'import org.springframework.data.mongodb.repository.MongoRepository;');
                    content = content.replace(/JpaRepository</g, 'MongoRepository<');
                    modified = true;
                }

                if (fullPath.includes('controller') || fullPath.includes('service') || fullPath.includes('repository') || fullPath.includes('model')) {
                    content = content.replace(/\bLong\s+id\b/g, 'String id');
                    content = content.replace(/\bLong\s+examId\b/g, 'String examId');
                    content = content.replace(/\bLong\s+studentId\b/g, 'String studentId');
                    content = content.replace(/\bLong\s+teacherId\b/g, 'String teacherId');
                    content = content.replace(/\bLong\s+subjectId\b/g, 'String subjectId');
                    content = content.replace(/\bLong\s+classId\b/g, 'String classId');
                    content = content.replace(/Map<Long,\s*String>/g, 'Map<String, String>');
                    content = content.replace(/<([A-Za-z0-9_]+),\s*Long>/g, '<$1, String>');
                    modified = true;
                }

                if (modified) {
                    fs.writeFileSync(fullPath, content);
                }
            }
        }
    }

    walkDir(srcDir);
    console.log('Migration Complete!');
} catch (e) {
    console.error(e);
}
