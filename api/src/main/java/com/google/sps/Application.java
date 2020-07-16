package com.google.sps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController

public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);

    try {
      ServiceCreation.createService();
    } catch(Exception e) {
      System.out.println("Working Directory = " + System.getProperty("user.dir"));
      System.out.println("Exception Caught Here: " + e);
    }
  }

  @GetMapping("/")
  public String hello() {
    return "Hello world!";
  }
}
