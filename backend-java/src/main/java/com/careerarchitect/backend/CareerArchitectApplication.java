package com.careerarchitect.backend;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.client.RestTemplate;

/**
 * CareerArchitect Backend Gateway Application
 */
@SpringBootApplication(scanBasePackages = "com.careerarchitect")
@EnableJpaRepositories(basePackages = "com.careerarchitect.repository")
@EntityScan(basePackages = "com.careerarchitect.model")
public class CareerArchitectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerArchitectApplication.class, args);
    }

    // Used by controller to talk to Python service
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // 🔥 THIS is what verifies Neon DB connection at startup
    @Bean
    CommandLineRunner check(DataSource ds) {
        return args -> {
            System.out.println("✅ DataSource connected: " + ds);
        };
    }
}
