package com.careerarchitect.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration; // Import this!
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * CareerArchitect Backend Gateway Application
 * * Main entry point for the Spring Boot microservice.
 * Acts as a secure gateway between React frontend and Python AI service.
 * * Port: 8080
 * * @author CareerArchitect Team
 * @version 1.0.0
 */
// FIXED: We added (exclude = {DataSourceAutoConfiguration.class})
// This tells Spring Boot: "Do not try to connect to a database!"
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class CareerArchitectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerArchitectApplication.class, args);
    }

    /**
     * Configure RestTemplate bean for HTTP communication with Python service
     * * @return RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}